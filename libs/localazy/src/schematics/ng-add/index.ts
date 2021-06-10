import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { AddPackageJsonScript } from '@rxap/schematics-utilities';
import { NgAddSchema } from './schema';

export default function(options: NgAddSchema): Rule {
  return async () => {

    return chain([
      AddPackageJsonScript('localazy', 'localazy'),
      () => {
        if (options.project) {
          return schematic('config', {
            project: options.project
          });
        } else {
          console.log('Default project not defined. Add the localazy target to a project with: ng g @rxap/plugin-localazy:config [project]');
        }
      }
    ])

  }
}
