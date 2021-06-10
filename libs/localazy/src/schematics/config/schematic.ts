import { chain, externalSchematic, Rule, SchematicsException } from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { ConfigSchema } from './schema';

export default function(options: ConfigSchema): Rule {

  return () => {

    let hasPackTarget: boolean | null = null;

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (!project.targets.has('localazy-download')) {
          project.targets.add({
            name:    'localazy',
            builder: '@rxap/plugin-localazy:download',
            options: {}
          });
        }
        if (!project.targets.has('localazy-upload')) {
          project.targets.add({
            name:    'localazy',
            builder: '@rxap/plugin-localazy:upload',
            options: {}
          });
        }

        hasPackTarget = project.targets.has('pack');
      }),
      () => {
        if (hasPackTarget === null) {
          throw new SchematicsException('It is unclear if the project has a the target "pack"');
        }
        if (hasPackTarget) {
          console.log('Project has pack target')
          return externalSchematic('@rxap/plugin-pack', 'add-target', {
            project: options.project,
            target: 'localazy-download',
            preBuild: true
          })
        }
      }
    ]);

  };

}
