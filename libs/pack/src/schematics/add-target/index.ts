import { chain, Rule, SchematicsException } from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { AddTargetSchema } from './schema';

export default function(options: AddTargetSchema): Rule {

  return () => {

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new SchematicsException('Could not extract target project.');
        }

        if (!project.targets.has('pack')) {
          throw new SchematicsException('The selected project does not have the target "pack"');
        } else {

          const pack = project.targets.get('pack')!;

          if (!pack.options) {
            pack.options = {};
          }

          const targets: string[] = pack.options.targets as string[] ?? [];

          if (targets.includes('build') && options.preBuild) {
            console.log(`Add target '${options.target}' before the build target.`);
            targets.splice(targets.indexOf('build'), 0, options.target);
          } else {
            console.log(`Add target '${options.target}' after the build target.`);
            targets.push(options.target);
          }

        }

      })
    ]);

  };

}
