import { chain, externalSchematic, noop, Rule, schematic, Tree } from '@angular-devkit/schematics';
import { InitFunctionsSchema } from './schema';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  GetPackageJson,
  InstallNodePackages
} from '@rxap/schematics-utilities';
import { TaskId } from '@angular-devkit/schematics/src/engine';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

export default function(options: InitFunctionsSchema): Rule {

  return async (host: Tree) => {

    const rootPackageJson = GetPackageJson(host);
    const hasNrwlNodePackage = Object.keys(rootPackageJson?.devDependencies ?? {}).includes('@nrwl/node');
    const hasFirebaseFunctions = Object.keys(rootPackageJson?.devDependencies ?? {}).includes('firebase-functions');

    const installTaskIdList: TaskId[] = [];

    return chain([
      hasNrwlNodePackage ? noop() : chain([
        AddPackageJsonDevDependency('@nrwl/node'),
        (_, context) => {
          installTaskIdList.push(context.addTask(new NodePackageInstallTask()));
        }
      ]),
      hasFirebaseFunctions ? noop() : chain([
        AddPackageJsonDependency('firebase-functions'),
        AddPackageJsonDependency('firebase-admin'),
        installTaskIdList.length ? noop() : InstallNodePackages()
      ]),
      (_, context) => {
        if (installTaskIdList.length) {
          installTaskIdList.push(context.addTask(new RunSchematicTask('@nrwl/node', 'application', { name: options.name }), installTaskIdList.slice()));
          installTaskIdList.push(context.addTask(new RunSchematicTask('config-functions', {
            project: options.name,
            initial: true
          }), installTaskIdList.slice()));
        } else {
          return chain([
            externalSchematic('@nrwl/node', 'application', { name: options.name }),
            schematic('config-functions', { project: options.name, initial: true })
          ]);
        }
      }
    ]);

  };

}
