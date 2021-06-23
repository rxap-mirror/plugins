import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { UpdatePeerDependenciesBuilderSchema } from './schema';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { PackageJson } from '@rxap/schematics-utilities';
import { PackageGraph } from '@lerna/package-graph';
import { createProjectGraph } from '@nrwl/workspace/src/core/project-graph';
import { ProjectGraph } from '@nrwl/workspace/src/core/project-graph/project-graph-models';
import { equals, unique } from '@rxap/utilities';
import { inc } from 'semver';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import { Project } from '@lerna/project';
import { collectUpdates } from '@lerna/collect-updates';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}

export class Builder {

  private readonly rootPackageVersionMap = new Map<string, string>();

  private readonly projectGraph: ProjectGraph;

  private readonly dependencyVersionMap = new Map<string, string>();

  private readonly projectNewVersion = new Map<string, string[]>();

  private readonly updates$: Promise<any[]>;

  private readonly flattenDependenciesMap = new Map<string, string[]>();

  constructor(
    public readonly options: UpdatePeerDependenciesBuilderSchema,
    public readonly context: BuilderContext
  ) {
    this.rootPackageVersionMap = this.loadRootPackageVersionMap();
    this.projectGraph = createProjectGraph();
    this.updates$ = this.loadUpdates();
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

    const projectName = this.context.target?.project;

    if (!projectName) {
      throw new Error('The target project is not defined!');
    }

    try {
      await this.update(projectName);
      for (const dependency of Array.from(this.projectNewVersion.keys())) {
        const versions = this.projectNewVersion.get(dependency)!;
        console.log(`${dependency}   ${versions[0]} -> ${versions[1]}`);
      }
      return { success: true };
    } catch (e) {
      console.error(`Failed to update peer dependencies for project '${projectName}': ${e.message}`);
      console.debug(e.stack);
      return { success: false, error: e.message };
    }

  }

  private async loadUpdates(): Promise<any[]> {

    const project = new Project(this.context.workspaceRoot);

    const packages = await project.getPackages();

    const packageGraph = new PackageGraph(packages);

    const updates = collectUpdates(
      packageGraph.rawPackageList,
      packageGraph,
      {
        cwd: this.context.workspaceRoot
      },
      {
        conventionalCommits: true
      }
    ).filter((node: any) => {
      // --no-private completely removes private packages from consideration
      if (node.pkg.private) {
        // TODO: (major) make --no-private the default
        return false;
      }

      if (!node.version) {
        // a package may be unversioned only if it is private
        if (node.pkg.private) {
          console.info('version', 'Skipping unversioned private package %j', node.name);
        } else {
          throw new Error('failed');
        }
      }

      return !!node.version;
    });

    console.log(`Changed packages count: ${updates.length}`);

    return updates;

  }

  private loadRootPackageVersionMap() {
    const map = new Map<string, string>();

    const rootPackageJson = this.parseJsonFile('package.json');

    for (const [ name, version ] of Object.entries(rootPackageJson.dependencies)) {
      map.set(name, (version as string).replace(/^[~^]/, ''));
    }

    for (const [ name, version ] of Object.entries(rootPackageJson.devDependencies)) {
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
      if (!this.flattenDependenciesMap.has(dependency)) {
        const dependencies = await this.flattenDependencies(this.projectGraph.dependencies[dependency].map(dependency => dependency.target));
        const filteredDependencies = await this.filterIgnoredDependencies(dependency, dependencies);
        this.flattenDependenciesMap.set(dependency, filteredDependencies);
      }
      flattenDependencies.push(...this.flattenDependenciesMap.get(dependency)!);
    }

    return flattenDependencies.filter(unique());
  }

  private async filterIgnoredDependencies(dependency: string, dependencies: string[]): Promise<string[]> {
    const ignore: Array<RegExp> = [];
    if (!dependency.match(/^npm:/)) {
      try {
        const options = await this.context.getTargetOptions({
          project: dependency,
          target: 'update-peer-dependencies'
        });

        const optionsIgnore: Array<RegExp> = Array.isArray(options.ignore) ? options
          .ignore
          .filter(pattern => typeof pattern === 'string')
          .map(pattern => new RegExp(pattern as string)) : [];

        ignore.push(...optionsIgnore);
      } catch (e) {
        console.warn(`Could not remove ignore dependencies from '${dependency}' builder options: ${e.message}`);
      }

      const packageJson = this.getProjectPackageJson(dependency);

      if (packageJson.dependencies) {
        const dependenciesIgnore = Object
          .keys(packageJson.dependencies)
          .map(dep => new RegExp(`${dep.replace(/\//g, '\\/')}`));

        ignore.push(...dependenciesIgnore);
      }
    }
    return dependencies.filter(dep => !ignore.some(regex => this.getPackageName(dep).match(regex)));
  }

  private getPackageName(dependencyName: string): string {
    const match = dependencyName.match(/npm:(.*)/);
    if (match) {
      return match[1];
    }

    const packageJson = this.getProjectPackageJson(dependencyName);

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
        const version = '^' + await this.getNewProjectVersion(dependencyName);
        this.dependencyVersionMap.set(dependencyName, version);
      }

    }

    return this.dependencyVersionMap.get(dependencyName)!;

  }

  private async hasProjectVersionChange(projectName: string): Promise<boolean> {

    const updates = await this.updates$;

    const packageJson = this.getProjectPackageJson(projectName);

    return !!updates.find((pkg: any) => pkg.name === packageJson.name);

  }

  private async getNewProjectVersion(projectName: string): Promise<string> {
    const packageJson = this.getProjectPackageJson(projectName);
    const version = packageJson.version;

    if (await this.hasProjectVersionChange(projectName)) {


      return new Promise((resolve, reject) => {

        const options = {
          lernaPackage: packageJson.name,
          path: dirname(join(this.context.workspaceRoot, this.getProjectPackageJsonPath(projectName))),
          config: require('conventional-changelog-angular')
        };

        conventionalRecommendedBump(options, (err: any, data: any) => {
          if (err) {
            return reject(err);
          }

          const releaseType = data.releaseType ?? 'patch';
          const newVersion = inc(version, releaseType);

          if (newVersion !== version) {
            this.projectNewVersion.set(projectName, [ version, newVersion ]);
          }

          if (!newVersion) {
            throw new Error('Could not resolve the new version');
          }

          resolve(newVersion);

        });

      });

    }

    return version;

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

  private async update(projectName: string) {
    const graphProjectDependency = this.projectGraph.dependencies[projectName];

    if (!graphProjectDependency) {
      throw new Error(`The dependencies for the project '${projectName}' are not available`);
    }

    const projectDependencies: string[] = graphProjectDependency.map(pdg => pdg.target);

    const flattenProjectDependencies: string[] = await this.flattenDependencies(projectDependencies);

    const packageJson = this.getProjectPackageJson(projectName);

    const projectPeerDependency = await this.filterIgnoredDependencies(projectName, flattenProjectDependencies);
    const projectDependency = flattenProjectDependencies.filter(projectDependency => !projectPeerDependency.includes(projectDependency));

    packageJson.peerDependencies = await this.mapToPackageDependencies(projectPeerDependency);
    packageJson.dependencies = await this.mapToPackageDependencies(projectDependency);

    // only write the package.json file if some peer dependencies changed
    this.writeProjectPackageJson(projectName, packageJson);

  }

}

export default Builder.Create();
