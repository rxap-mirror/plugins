import { apply, applyTemplates, chain, mergeWith, move, noop, Rule, Tree, url } from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { AddSchema } from './schema';
import { join } from 'path';
import { GetProjectSourceRoot } from '@rxap/schematics-utilities';

export default function(options: AddSchema): Rule {

  return async (host: Tree) => {

    const projectSourceRoot = GetProjectSourceRoot(host, options.project);

    const indexScssFilePath = join(projectSourceRoot, '_index.scss');

    const angularJson = JSON.parse(host.read('/angular.json')!.toString());

    const prefix = angularJson && angularJson.projects[options.project] && angularJson.projects[options.project].prefix;

    if (!prefix) {
      throw new Error('The project has not a defined prefix.');
    }

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('scss-bundle')) {

        } else {

          project.targets.add({
            name:    'scss-bundle',
            builder: '@rxap/plugin-scss-bundle:build',
            options: {
              buildTarget:   `${options.project}:build:production`,
              skipBuild:     true,
              ignoreImports: [ '~@angular/.*' ]
            }
          });

        }

        if (project.targets.has('pack')) {
          const packTarget = project.targets.get('pack')!;

          if (!packTarget.options) {
            packTarget.options = {};
          }

          if (!packTarget.options.targets || !Array.isArray(packTarget.options.targets)) {
            packTarget.options.targets = [];
          }

          packTarget.options.targets.push(`${options.project}:scss-bundle`);

        }

      }),
      host.exists(indexScssFilePath) ?
      noop() :
      mergeWith(apply(url('./files'), [
        applyTemplates({ ...options, prefix }),
        move(projectSourceRoot)
      ]))
    ]);

  };

}
