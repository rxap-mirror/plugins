import {
  apply,
  chain,
  externalSchematic,
  forEach,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';
import { getWorkspace } from '@schematics/angular/utility/workspace';

export async function GetProjectBasePath(host: Tree, project: string) {
  let projectBasePath = join('apps', project);
  const projectName   = project;
  const workspace     = await getWorkspace(host);

  const hasProject = workspace.projects.has(projectName);

  if (hasProject) {
    console.log(`Project '${projectName}' already exists`);
    projectBasePath = workspace.projects.get(projectName)!.root;
  } else {
    throw new Error('Could not find the project');
  }
  return projectBasePath;
}

export default function(options: ConfigSchema): Rule {

  return async host => {

    const projectBasePath = await GetProjectBasePath(host, options.project);

    let hasPackTarget: boolean | null = null;

    return chain([
      mergeWith(apply(url('./files'), [
        template({}),
        // TODO : extract the project src root from angular.json
        move(join(projectBasePath, 'src')),
        forEach(entry => {
          if (host.exists(entry.path)) {
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

        if (project.targets.has('i18n')) {

          console.log('Plugin in is already configured.');

        } else {

          project.targets.add({
            name:    'i18n',
            builder: '@rxap/plugin-i18n:build',
            options: {
              availableLanguages: options.availableLanguages ?? [ 'en' ],
              defaultLanguage: options.defaultLanguage ?? 'en',
              indexHtmlTemplate: join(projectBasePath, 'src', 'i18n.index.html.hbs'),
              assets: options.assets ?? []
            }
          });

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
            target: `${options.project}:i18n`
          });
        }
      }
    ]);

  };

}
