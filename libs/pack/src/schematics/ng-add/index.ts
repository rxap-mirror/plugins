import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { NgAddSchema } from './schema';

export default function(options: NgAddSchema): Rule {
  return async () => {

    return chain([
      () => {
        if (options.project) {
          return schematic('config', {
            project: options.project
          });
        } else {
          console.log('Default project not defined. Add the pack target to a project with: ng g @rxap/plugin-pack:config [project]');
        }
      }
    ]);

  };
}
