import { chain, Rule } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { AddPackageJsonDevDependency, AddPackageJsonScript } from '@rxap/schematics-utilities';
import { NgAddSchema } from './schema';

export default function(options: NgAddSchema): Rule {
  return async () => {

    return chain([
      AddPackageJsonDevDependency('@localazy/cli'),
      AddPackageJsonScript('localazy', 'localazy'),
      (_, context) => {
        const installTaskId = context.addTask(new NodePackageInstallTask());
        if (options.project) {
          context.addTask(new RunSchematicTask('config', {
            project: options.project,
          }), [ installTaskId ]);
        } else {
          console.log('Default project not defined. Add the localazy target to a project with: ng g @rxap/plugin-localazy:config [project]');
        }
      }
    ])

  }
}
