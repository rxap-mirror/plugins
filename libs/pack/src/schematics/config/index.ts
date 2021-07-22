import { chain, Rule } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: ConfigSchema): Rule {
  return () => {
    return chain([
      UpdateAngularProject((project) => {
        if (!project.targets.has('pack')) {

          if (project.targets.has('build')) {

            project.targets.add('pack', {
              builder: '@rxap/plugin-pack:build',
              options: { targets: [ `${options.project}:build` ] }
            });

            const buildTarget = project.targets.get('build')!;

            for (const configuration of Object.keys(buildTarget.configurations)) {
              project.targets.add(`pack:${configuration}`, {
                builder: '@rxap/plugin-pack:build',
                options: { targets: [ `${options.project}:build:${configuration}` ] }
              });
            }

          } else {

            project.targets.add('pack', {
              builder: '@rxap/plugin-pack:build',
              options: { targets: [] }
            });

          }

        } else {
          console.warn(`The project '${options.project}' has already the builder pack.`);
        }
      }, { projectName: options.project })
    ]);
  };
}
