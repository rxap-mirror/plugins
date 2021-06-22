import { chain, Rule, SchematicsException } from '@angular-devkit/schematics';
import { AddTargetSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: AddTargetSchema): Rule {

  return () => {

    return chain([
      UpdateAngularProject((project) => {
        if (!project.targets.has('pack')) {
          throw new SchematicsException('The selected project does not have the target "pack"');
        } else {

          const pack = project.targets.get('pack')!;

          if (!pack.options) {
            pack.options = {};
          }

          const targets: string[] = pack.options.targets as string[] ?? [];

          if (!targets.includes(options.target)) {
            if (targets.some(target => target.includes(':build')) && options.preBuild) {
              console.log(`Add target '${options.target}' before the build target.`);
              targets.splice(targets.findIndex(target => target.includes(':build')), 0, options.target);
            } else {
              console.log(`Add target '${options.target}' after the build target.`);
              targets.push(options.target);
            }
          }

        }

      }, { projectName: options.project })
    ]);

  };

}
