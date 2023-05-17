import {
  apply,
  chain,
  externalSchematic,
  forEach,
  mergeWith,
  noop,
  Rule,
  schematic,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { InitFunctionsSchema } from './schema';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  AddPackageJsonScript,
  GetPackageJson,
  InstallNodePackages,
} from '@rxap/schematics-utilities';
import { TaskId } from '@angular-devkit/schematics/src/engine';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';

export default function (options: InitFunctionsSchema): Rule {
  return async (host: Tree) => {
    const rootPackageJson = GetPackageJson(host);
    const hasNrwlNodePackage = Object.keys(
      rootPackageJson?.devDependencies ?? {}
    ).includes('@nx/node');
    const hasFirebaseFunctions = Object.keys(
      rootPackageJson?.devDependencies ?? {}
    ).includes('firebase-functions');

    const installTaskIdList: TaskId[] = [];

    return chain([
      hasNrwlNodePackage
        ? noop()
        : chain([
            AddPackageJsonDevDependency('@nx/node'),
            (_, context) => {
              installTaskIdList.push(
                context.addTask(new NodePackageInstallTask())
              );
            },
          ]),
      hasFirebaseFunctions
        ? noop()
        : chain([
            AddPackageJsonDependency('firebase-functions'),
            AddPackageJsonDependency('firebase-admin'),
            installTaskIdList.length ? noop() : InstallNodePackages(),
          ]),
      mergeWith(
        apply(url('./files'), [
          template({}),
          forEach((entry) => {
            if (host.exists(entry.path)) {
              return null;
            }
            return entry;
          }),
        ])
      ),
      AddPackageJsonScript(
        'build:functions:watch',
        'nx run functions:build --watch'
      ),
      AddPackageJsonScript(
        'build:functions',
        'nx run functions:build:production'
      ),
      AddPackageJsonScript(
        'firebase:emulators:start',
        'env-cmd firebase emulators:start --export-on-exit=\\".firebase-emulator\\"' +
          ' --import=\\".firebase-emulator\\"'
      ),
      (_, context) => {
        if (installTaskIdList.length) {
          installTaskIdList.push(
            context.addTask(
              new RunSchematicTask('@nx/node', 'application', {
                name: options.name,
              }),
              installTaskIdList.slice()
            )
          );
          installTaskIdList.push(
            context.addTask(
              new RunSchematicTask('config-functions', {
                project: options.name,
                initial: true,
              }),
              installTaskIdList.slice()
            )
          );
        } else {
          return chain([
            externalSchematic('@nx/node', 'application', {
              name: options.name,
            }),
            schematic('config-functions', {
              project: options.name,
              initial: true,
            }),
          ]);
        }
      },
    ]);
  };
}
