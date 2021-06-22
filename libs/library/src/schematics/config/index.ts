import { chain, noop, Rule, schematic } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';

export default function(options: ConfigSchema): Rule {

  return async () => {

    return chain([
      options.schematics ? schematic('config-schematics', { project: options.project, type: 'schematics' }) : noop(),
      options.migrations ? schematic('config-schematics', { project: options.project, type: 'migrations' }) : noop(),
      options.builders ? schematic('config-schematics', { project: options.project, type: 'builders' }) : noop(),
      options.updatePackageGroup ? schematic('config-update-package-group', { project: options.project }) : noop(),
      options.updatePeerDependencies ? schematic('config-update-peer-dependencies', { project: options.project }) : noop()
    ]);

  };

}
