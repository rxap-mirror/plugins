import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { UpdatePackageGroupBuilderSchema } from './schema';
import { ReadFile } from './read-file';
import { join } from 'path';
import { WriteFile } from './write-file';
import { existsSync } from 'fs';
import { equals } from '../utils/equals';

export interface Target extends json.JsonObject {
  project: string;
  target: string;
  configuration: string;
}

export class Builder {

  constructor(
    public readonly options: UpdatePackageGroupBuilderSchema,
    public readonly context: BuilderContext
  ) {
  }

  public static Run(
    options: UpdatePackageGroupBuilderSchema,
    context: BuilderContext
  ) {
    return new Builder(options, context).run();
  }

  public static Create(): any {
    return createBuilder(Builder.Run);
  }

  public async extractRootPath(project: string): Promise<string> {

    const projectMetadata = await this.context.getProjectMetadata(project);
    const root = projectMetadata.root;

    if (!root || typeof root !== 'string') {
      throw new Error(`Could not extract root path for project '${project}'`);
    }

    return root;
  }

  public async run(): Promise<BuilderOutput> {

    if (!this.context.target?.project) {
      throw new Error('The target project is not defined!');
    }

    const readFile = new ReadFile();

    const root = await this.extractRootPath(this.context.target?.project);

    const packageJsonFilePath = join(process.cwd(), root, 'package.json');

    if (!existsSync(packageJsonFilePath)) {
      throw new Error(`Could not find package.json in location '${packageJsonFilePath}'`);
    }

    const packageJson = JSON.parse(readFile.sync(packageJsonFilePath));

    if (!packageJson.peerDependencies) {
      return { success: true };
    }

    const name: string = packageJson.name;
    const scopeMatch = name.match(/^@([^/]+)/);

    if (scopeMatch) {
      const scope = scopeMatch[1];

      // extract all packages with the same scope from the
      // peer dependencies
      const sameScopePackageGroup = Object
        .keys(packageJson.peerDependencies)
        .filter(peerName => peerName.match(new RegExp(`^@${scope}`)));

      // CoerceProperty(packageJson, 'ng-update.packageGroup', []);

      if (!packageJson['ng-update']) {
        packageJson['ng-update'] = { packageGroup: [] };
      }

      // extract all defined package group and exclude
      // packages with the same scope
      const existingPackageGroup: string[] = packageJson['ng-update']
        .packageGroup
        .filter((peerName: string) => !peerName.match(new RegExp(`^@${scope}`)));

      const newPackageGroup = [
        name,
        ...existingPackageGroup,
        ...sameScopePackageGroup
      ].filter((item, index, self) => self.indexOf(item) === index)
        .sort((a, b) => a.localeCompare(b));

      packageJson['ng-update'].packageGroup = newPackageGroup;

      const oldPackageJson = JSON.parse(readFile.sync(packageJsonFilePath));

      if (!equals(oldPackageJson, packageJson)) {

        const writeFile = new WriteFile();

        writeFile.sync(packageJsonFilePath, JSON.stringify(
          packageJson,
          undefined,
          2
        ));

        console.log('Set ng-update.packageGroup = ', newPackageGroup);

      } else {
        console.info(`The package.json ng-update.packageGroup is not updated. No changes detected!`);
      }

    }

    return { success: true };

  }

}

export default Builder.Create();
