import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { UpdatePeerDependenciesBuilderSchema } from './schema';
import { join } from 'path';
import {
  existsSync,
  readFileSync,
  writeFileSync
} from 'fs';
import { PackageJson } from '@rxap/schematics-utilities';
import { createProjectGraphAsync, readCachedProjectGraph } from 'nx/src/project-graph/project-graph';
import { ProjectGraph } from 'nx/src/config/project-graph';
import { equals } from '../utils/equals';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}

export class Builder {

  private readonly rootPackageVersionMap = new Map<string, string>();

  private projectGraph!: ProjectGraph;

  private readonly dependencyVersionMap = new Map<string, string>();

  private readonly projectNewVersion = new Map<string, string[]>();

  private readonly flattenDependenciesMap = new Map<string, string[]>();

  constructor(
    public readonly options: UpdatePeerDependenciesBuilderSchema,
    public readonly context: BuilderContext
  ) {
    this.rootPackageVersionMap = this.loadRootPackageVersionMap();
    try {
      this.projectGraph = readCachedProjectGraph();
    } catch (e: any) {
      console.warn('A cached project graph was not found. Load the project graph when needed.');
    }
    this.options.dependencies = this.options.dependencies ?? [];
    this.options.dependencies.push('tslib');
    this.options.dependencies = this.options.dependencies.filter((value, index, self) => self.indexOf(value) === index);
  }

  public static Run(
    options: UpdatePeerDependenciesBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  public async run(): Promise<BuilderOutput> {

    this.projectGraph = this.projectGraph ?? await createProjectGraphAsync();

    const projectName = this.context.target?.project;

    if (!projectName) {
      throw new Error('The target project is not defined!');
    }

    try {
      await this.update(projectName);
      for (const dependency of Array.from(this.projectNewVersion.keys())) {
        const versions = this.projectNewVersion.get(dependency)!;
        console.log(`${dependency}   ${versions[ 0 ]} -> ${versions[ 1 ]}`);
      }
      return { success: true };
    } catch (e: any) {
      console.error(`Failed to update peer dependencies for project '${projectName}': ${e.message}`);
      console.debug(e.stack);
      return { success: false, error: e.message };
    }

  }

  private loadRootPackageVersionMap() {
    const map = new Map<string, string>();

    const rootPackageJson = this.parseJsonFile('package.json');

    for (const [ name, version ] of Object.entries(rootPackageJson.dependencies ?? {})) {
      map.set(name, (version as string).replace(/^[~^]/, ''));
    }

    for (const [ name, version ] of Object.entries(rootPackageJson.devDependencies ?? {})) {
      map.set(name, (version as string).replace(/^[~^]/, ''));
    }

    return map;
  }

  private parseJsonFile<T = PackageJson>(filePath: string): T {
    const fullPath = join(this.context.workspaceRoot, filePath);
    if (!existsSync(fullPath)) {
      throw new Error(`The json file '${fullPath}' does not exists.`);
    }
    return JSON.parse(readFileSync(fullPath)!.toString('utf-8'));
  }

  private async flattenDependencies(knownDependencies: string[]): Promise<string[]> {
    const flattenDependencies: string[] = knownDependencies.slice();

    for (const dependency of knownDependencies) {
      // check if the dependencies for the dependency are already resolved
      // else resolve the dependencies and update the cache
      if (!this.flattenDependenciesMap.has(dependency)) {
        const dependencies = this.projectGraph.dependencies[ dependency ];
        if (!dependencies || !Array.isArray(dependencies)) {
          // this is a leaf dependency
          this.flattenDependenciesMap.set(dependency, []);
        } else {
          const flattenDependencies  = await this.flattenDependencies(dependencies.map(dependency => dependency.target));
          const filteredDependencies = await this.filterForPeerDependencies(dependency, flattenDependencies);
          this.flattenDependenciesMap.set(dependency, filteredDependencies);
        }
      }
      flattenDependencies.push(...this.flattenDependenciesMap.get(dependency)!);
    }

    return flattenDependencies.filter((value, index, self) => self.indexOf(value) === index);
  }

  private async filterIgnoredDependencies(dependency: string, dependencies: string[]): Promise<string[]> {
    const ignore: Array<RegExp> = [];
    if (!dependency.match(/^npm:/)) {
      try {
        const options = await this.context.getTargetOptions({
          project: dependency,
          target:  'update-peer-dependencies'
        });

        const optionsIgnore: Array<RegExp> = Array.isArray(options.ignore) ? options
          .ignore
          .filter(pattern => typeof pattern === 'string')
          .map(pattern => new RegExp(pattern as string)) : [];

        ignore.push(...optionsIgnore);
      } catch (e: any) {
        console.warn(`Could not remove ignore dependencies from '${dependency}' builder options: ${e.message}`);
      }

      const packageJson = this.getProjectPackageJson(dependency);

      if (packageJson.devDependencies) {
        const dependenciesIgnore = Object
          .keys(packageJson.devDependencies)
          .map(dep => new RegExp(`${dep.replace(/\//g, '\\/')}`));

        ignore.push(...dependenciesIgnore);
      }

    }
    return dependencies.filter(dep => !ignore.some(regex => this.getPackageName(dep).match(regex)));
  }

  private async filterForPeerDependencies(dependency: string, dependencies: string[]): Promise<string[]> {
    const ignore: Array<RegExp> = [];
    if (!dependency.match(/^npm:/)) {

      const packageJson = this.getProjectPackageJson(dependency);

      if (packageJson.dependencies) {
        const dependenciesIgnore = Object
          .keys(packageJson.dependencies)
          .map(dep => new RegExp(`${dep.replace(/\//g, '\\/')}`));

        ignore.push(...dependenciesIgnore);
      }
      if (packageJson.devDependencies) {
        const dependenciesIgnore = Object
          .keys(packageJson.devDependencies)
          .map(dep => new RegExp(`${dep.replace(/\//g, '\\/')}`));

        ignore.push(...dependenciesIgnore);
      }
    }
    return (await this.filterIgnoredDependencies(dependency, dependencies))
      .filter(dep => !ignore.some(regex => this.getPackageName(dep).match(regex)));
  }

  private getPackageName(dependencyName: string): string {
    const match = dependencyName.match(/npm:(.*)/);
    if (match) {
      return match[1];
    }

    const packageJson = this.getProjectPackageJson(dependencyName);

    if (!packageJson.name) {
      throw new Error(`The package name for the dependency '${dependencyName}' is not defined!`);
    }

    return packageJson.name;
  }

  private async getDependencyVersion(dependencyName: string): Promise<string> {

    if (!this.dependencyVersionMap.has(dependencyName)) {

      const match = dependencyName.match(/npm:(.*)/);
      if (match) {

        const packageName = match[1];

        if (!this.rootPackageVersionMap.has(packageName)) {
          throw new Error(`Could not find root package version for '${packageName}'`);
        }

        const version = '^' + this.rootPackageVersionMap.get(packageName)!;
        this.dependencyVersionMap.set(dependencyName, version);
      } else {
        const version = '^' + (await this.getProjectPackageJson(dependencyName)).version;
        this.dependencyVersionMap.set(dependencyName, version);
      }

    }

    return this.dependencyVersionMap.get(dependencyName)!;

  }

  private getProjectPackageJson(projectName: string): PackageJson {
    return this.parseJsonFile(this.getProjectPackageJsonPath(projectName));
  }

  private getProjectPackageJsonPath(projectName: string): string {
    const packageJsonFile = join(this.projectGraph.nodes[projectName].data.root, 'package.json');

    if (!existsSync(packageJsonFile)) {
      throw new Error(`Could not find the package.json file for the project '${projectName}'`);
    }
    return packageJsonFile;
  }

  private getProjectNgPackageJson(projectName: string): any {
    return this.parseJsonFile(this.getProjectNgPackageJsonPath(projectName));
  }

  private getProjectNgPackageJsonPath(projectName: string): string {
    const packageJsonFile = join(this.projectGraph.nodes[projectName].data.root, 'ng-package.json');

    if (!existsSync(packageJsonFile)) {
      throw new Error(`Could not find the ng-package.json file for the project '${projectName}'`);
    }
    return packageJsonFile;
  }

  private hasProjectNgPackageJsonPath(projectName: string): boolean {
    const packageJsonFile = join(this.projectGraph.nodes[projectName].data.root, 'ng-package.json');

    return existsSync(packageJsonFile);
  }

  private writeProjectNgPackageJson(projectName: string, ngPackageJson: any) {
    const ngPackageJsonFile = join(this.projectGraph.nodes[projectName].data.root, 'ng-package.json');

    if (!existsSync(ngPackageJsonFile)) {
      throw new Error(`Could not find the ng-package.json file for the project '${projectName}'`);
    }

    const oldPackageJson = JSON.parse(readFileSync(ngPackageJsonFile).toString('utf-8'));

    if (!equals(ngPackageJson, oldPackageJson)) {
      writeFileSync(ngPackageJsonFile, JSON.stringify(ngPackageJson, undefined, 2));
    } else {
      console.info(`The ng-package.json peer dependencies for the project '${projectName}' is not updated. No changes detected!`);
    }
  }

  private writeProjectPackageJson(projectName: string, packageJson: PackageJson) {
    const packageJsonFile = join(this.projectGraph.nodes[projectName].data.root, 'package.json');

    if (!existsSync(packageJsonFile)) {
      throw new Error(`Could not find the package.json file for the project '${projectName}'`);
    }

    const oldPackageJson = JSON.parse(readFileSync(packageJsonFile).toString('utf-8'));

    if (!equals(packageJson, oldPackageJson)) {
      writeFileSync(packageJsonFile, JSON.stringify(packageJson, undefined, 2));
    } else {
      console.info(`The package.json peer dependencies for the project '${projectName}' is not updated. No changes detected!`);
    }
  }

  private async mapToPackageDependencies(projectDependencies: string[]): Promise<Record<string, string>> {
    return (await Promise.all(projectDependencies.map(async peerDependency => [ this.getPackageName(peerDependency), await this.getDependencyVersion(peerDependency) ])))
      .sort((aItem, bItem) => {

        const a = aItem[0];
        const b = bItem[0];

        if (a.match(/^@/)) {
          if (b.match(/^@/)) {
            return a.replace(/^@/, '').localeCompare(b.replace(/^@/, ''));
          } else {
            return -1;
          }
        } else if (b.match(/^@/)) {
          return 1;
        } else {
          return a.localeCompare(b);
        }

      })
      .map(item => ({ [item[0]]: item[1] }))
      .reduce((map, item) => ({ ...map, ...item }), {});
  }

  private updateNgPackage(projectName: string, dependencies: string[]) {

    if (!this.hasProjectNgPackageJsonPath(projectName)) {
      return;
    }

    const root = this.getProjectNgPackageJson(projectName);

    root.allowedNonPeerDependencies = dependencies;

    this.writeProjectNgPackageJson(projectName, root);
  }

  private async update(projectName: string) {
    const graphProjectDependency = this.projectGraph.dependencies[projectName];

    if (!graphProjectDependency) {
      throw new Error(`The dependencies for the project '${projectName}' are not available`);
    }

    // the list of direct dependencies of the project
    const projectDependencies: string[] = graphProjectDependency.map(pdg => pdg.target);

    // the list of direct AND indirect of the project
    const flattenProjectDependencies: string[] = await this.flattenDependencies(projectDependencies);

    const packageJson = this.getProjectPackageJson(projectName);

    const projectPeerDependency = await this.filterForPeerDependencies(projectName, flattenProjectDependencies);
    const projectDependency = await this.filterIgnoredDependencies(projectName, flattenProjectDependencies.filter(projectDependency => !projectPeerDependency.includes(projectDependency)));

    projectDependency.push(...this.options.dependencies.map(dependency => [ 'npm', dependency ].join(':')));

    packageJson.peerDependencies = await this.mapToPackageDependencies(projectPeerDependency);
    packageJson.dependencies = await this.mapToPackageDependencies(projectDependency);

    // only write the package.json file if some peer dependencies changed
    this.writeProjectPackageJson(projectName, packageJson);

    this.updateNgPackage(projectName, Object.keys(packageJson.dependencies));

  }

}

export default Builder.Create();
