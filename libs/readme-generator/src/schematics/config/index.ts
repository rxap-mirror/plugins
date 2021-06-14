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
import { createDefaultPath } from '@schematics/angular/utility/workspace';

export default function (options: ConfigSchema): Rule {
  return async (host: Tree) => {
    const projectRootLibPath = await createDefaultPath(
      host,
      options.project as string
    );

    const projectRootPath = join(projectRootLibPath, '../../');
    const readmeTemplatePath = join(projectRootPath, 'README.md.handlebars');

    let hasPackTarget: boolean | null = null;

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('readme')) {
        } else {
          project.targets.add({
            name: 'readme',
            builder: `@rxap/plugin-readme-generator:${options.type}`,
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
          console.log('Project has pack target');
          return externalSchematic('@rxap/plugin-pack', 'add-target', {
            project: options.project,
            target: `${options.project}:readme`,
            preBuild: true
          });
        }
      },
      mergeWith(
        apply(url('./files/' + options.type), [
          template({}),
          move(projectRootPath),
          forEach(entry => {
            if (host.exists(entry.path)) {
              if (options.overwrite && entry.path.includes(readmeTemplatePath)) {
                // only overwrite the readme.mf.handlebars file
                host.overwrite(entry.path, entry.content);
              } else {
                return null;
              }
            }
            return entry;
          })
        ])
      )
    ]);
  };
}
