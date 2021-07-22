import { chain, Rule } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: ConfigSchema): Rule {
  return () => {
    return chain([
      UpdateAngularProject((project) => {
        if (!project.targets.has('pack')) {

          const targets: string[] = [];
          const configurations: Record<string, { targets: string[] }> = {};

          if (project.targets.has('build')) {

            targets.push(`${options.project}:build`);

            const buildTarget = project.targets.get('build')!;

            for (const configuration of Object.keys(buildTarget.configurations)) {
              configurations[configuration] = { targets: [ `${options.project}:build:${configuration}` ] };
            }

          }

          project.targets.add('pack', {
            builder: '@rxap/plugin-pack:build',
            options: { targets },
            configurations
          });

        } else {
          console.warn(`The project '${options.project}' has already the builder pack.`);
        }
      }, { projectName: options.project })
    ]);
  };
}
