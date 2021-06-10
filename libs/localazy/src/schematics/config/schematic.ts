import { chain, externalSchematic, Rule, SchematicsException } from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';

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
            name: 'localazy-download',
            builder: '@rxap/plugin-localazy:download',
            options: {}
          });
        }
        if (!project.targets.has('localazy-upload')) {
          project.targets.add({
            name: 'localazy-upload',
            builder: '@rxap/plugin-localazy:upload',
            options: {}
          });
        }
        if (project.targets.has('extract-i18n')) {
          const extractI18n = project.targets.get('extract-i18n')!;
          if (!extractI18n.options) {
            extractI18n.options = {};
          }
          extractI18n.options.format = 'xliff2';
          extractI18n.options.outputPath = join(project.sourceRoot, 'i18n');
          project.targets.set('extract-i18n', extractI18n);
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
            target: `${options.project}:localazy-download`,
            preBuild: true
          })
        }
      }
    ]);

  };

}
