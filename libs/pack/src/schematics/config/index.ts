import { chain, Rule } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: ConfigSchema): Rule {
  return () => {
    return chain([
      UpdateAngularProject((project) => {
        if (!project.targets.has('pack')) {

          const targets: string[] = [];

          if (project.targets.has('build')) {
            const buildTarget = project.targets.get('build')!;

            if (buildTarget.configurations && buildTarget.configurations['production']) {
              targets.push(`${options.project}:build:production`);
            } else {
              targets.push(`${options.project}:build`);
            }

          }

          project.targets.add('pack', {
            builder: '@rxap/plugin-pack:build',
            options: { targets }
          });

        } else {
          console.warn(`The project '${options.project}' has already the builder pack.`);
        }
      }, { projectName: options.project })
    ]);
  };
}
