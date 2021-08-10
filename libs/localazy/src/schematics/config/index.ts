import {
  apply,
  chain,
  externalSchematic,
  forEach,
  mergeWith,
  Rule,
  SchematicsException,
  url
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';
import { applyTemplates } from '@angular-devkit/schematics/src/rules/template';
import { GetProjectSourceRoot } from '@rxap/schematics-utilities';
import { UpdateEnvFile } from './update-env-file';

export default function(options: ConfigSchema): Rule {

  return async host => {

    const projectSourceRoot = GetProjectSourceRoot(host, options.project);

    let hasPackTarget: boolean | null = null;

    return chain([
      mergeWith(apply(url('./files'), [
        applyTemplates({ sourceRoot: projectSourceRoot }),
        forEach(entry => {
          if (host.exists(entry.path)) {
            if (options.overwrite) {
              host.overwrite(entry.path, entry.content);
            }
            return null;
          }
          return entry;
        })
      ])),
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
          const buildOptions: Record<string, any> = {};
          if (project.targets.has('extract-i18n')) {
            buildOptions.extractTarget = options.project + ':extract-i18n';
          }
          if (options.extractTarget) {
            buildOptions.extractTarget = options.extractTarget;
          }
          project.targets.add({
            name: 'localazy-upload',
            builder: '@rxap/plugin-localazy:upload',
            options: buildOptions
          });
        }
        if (options.overwrite) {
          if (options.extractTarget) {
            const buildTarget = project.targets.get('localazy-upload')!;
            if (!buildTarget.options) {
              buildTarget.options = {};
            }
            buildTarget!.options.extractTarget = options.extractTarget;
          }
        }

        if (project.targets.has('extract-i18n')) {
          const extractI18n = project.targets.get('extract-i18n')!;
          if (!extractI18n.options) {
            extractI18n.options = {};
          }
          extractI18n.options.format = 'xliff2';
          if (!project.sourceRoot) {
            throw new SchematicsException('The project source root is not defined');
          }
          extractI18n.options.outputPath = join(project.sourceRoot, 'i18n');
        }

        hasPackTarget = project.targets.has('pack');
      }),
      () => {
        if (hasPackTarget === null) {
          throw new SchematicsException('It is unclear if the project has a the target "pack"');
        }
        if (hasPackTarget) {
          console.log('Project has pack target');
          return externalSchematic('@rxap/plugin-pack', 'add-target', {
            project: options.project,
            target: `${options.project}:localazy-download`,
            preBuild: true
          });
        }
      },
      tree => {
        const i18nGitIgnoreFilePath = join(projectSourceRoot, '.gitignore');
        if (!tree.exists(i18nGitIgnoreFilePath)) {
          tree.create(i18nGitIgnoreFilePath, '');
        }
        let i18nGitIgnoreContent = tree.read(i18nGitIgnoreFilePath)!.toString('utf-8');
        if (!i18nGitIgnoreContent.includes('/i18n')) {
          i18nGitIgnoreContent += '\n/i18n';
        }
        tree.overwrite(i18nGitIgnoreFilePath, i18nGitIgnoreContent);
      },
      UpdateEnvFile(options)
    ]);

  };

}
