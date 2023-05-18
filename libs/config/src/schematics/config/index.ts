import { chain, externalSchematic, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: ConfigSchema): Rule {

  return async (host: Tree) => {

    return chain([
      UpdateAngularProject((project) => {
        if (!project.targets.has('config')) {

          let buildTarget = options.buildTarget;

          if (!buildTarget) {
            if (project.targets.has('build')) {
              if (project.targets.get('build')!.configurations?.production) {
                buildTarget = `${options.project}:build:production`;
              } else {
                buildTarget = `${options.project}:build`;
              }
            } else {
              throw new SchematicsException('Could not determine the build target. Provide the build target option and rerun the schematic.');
            }
          }

          project.targets.add('config', {
            builder: '@rxap/plugin-config:config',
            options: {
              buildTarget
            }
          });

        } else {
          console.warn(`The project '${options.project}' has already the builder config.`);
        }

      }, { projectName: options.project }),
    ]);

  };

}
