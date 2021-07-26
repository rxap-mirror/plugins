import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { InstallPeerDependencies } from '@rxap/schematics-utilities';
import { NgAddSchema } from './schema';

export default function(options: NgAddSchema): Rule {
  return chain([
    InstallPeerDependencies(),
    () => {
      if (options.project) {
        return schematic('config', {
          project: options.project,
          buildTarget: options.buildTarget
        });
      } else {
        console.log('Default project not defined. Add the config target to a project with: ng g @rxap/plugin-config:config [project]');
      }
    }
  ]);
}
