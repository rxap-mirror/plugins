import { chain, externalSchematic, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: ConfigSchema): Rule {

  return async (host: Tree) => {

    let hasPackTarget: boolean | null = null;

    return chain([
      UpdateAngularProject((project) => {
        if (!project.targets.has('config')) {

          let buildTarget = options.buildTarget;

          if (!buildTarget) {
            if (project.targets.has('build')) {
              if (project.targets.get('build')!.configurations.production) {
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

        hasPackTarget = project.targets.has('pack');

      }, { projectName: options.project }),
      () => {
        if (hasPackTarget === null) {
          throw new SchematicsException('It is unclear if the project has a the target "pack"');
        }
        if (hasPackTarget) {
          console.log('Project has pack target');
          return externalSchematic('@rxap/plugin-pack', 'add-target', {
            project: options.project,
            target: `${options.project}:config`,
            preBuild: false
          });
        }
      }
    ]);

  };

}
