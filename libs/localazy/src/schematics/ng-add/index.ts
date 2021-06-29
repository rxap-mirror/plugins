import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { AddPackageJsonDevDependency, InstallPeerDependencies } from '@rxap/schematics-utilities';
import { NgAddSchema } from './schema';

export default function(options: NgAddSchema): Rule {
  return chain([
    AddPackageJsonDevDependency('@localazy/cli'),
    InstallPeerDependencies(),
    () => {
      if (options.project) {
        return schematic('config', {
          project: options.project
        });
      } else {
        console.log('Default project not defined. Add the pack target to a project with: ng g @rxap/plugin-localazy:config [project]');
      }
    }
  ]);
}
