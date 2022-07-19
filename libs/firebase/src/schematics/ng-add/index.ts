import { chain, noop, Rule, schematic } from '@angular-devkit/schematics';
import { AddPackageJsonScript, InstallPeerDependencies } from '@rxap/schematics-utilities';
import { NgAddSchema } from './schema';

export default function(options: NgAddSchema): Rule {
  return chain([
    InstallPeerDependencies(),
    AddPackageJsonScript('firebase', 'firebase'),
    options.init && options.functions ? schematic('init-functions', {}) : noop()
  ]);
}
