import {
  apply,
  chain,
  forEach,
  mergeWith,
  move,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nx/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';
import { GetProjectRoot } from '@rxap/schematics-utilities';

export default function (options: ConfigSchema): Rule {
  return async (host: Tree) => {
    const projectRoot = GetProjectRoot(host, options.project);

    const readmeTemplatePath = join(projectRoot, 'README.md.handlebars');

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
            options: {},
          });
        }
      }),
      mergeWith(
        apply(url('./files/' + options.type), [
          template({}),
          move(projectRoot),
          forEach((entry) => {
            if (host.exists(entry.path)) {
              if (
                options.overwrite &&
                entry.path.includes(readmeTemplatePath)
              ) {
                // only overwrite the readme.mf.handlebars file
                host.overwrite(entry.path, entry.content);
              } else {
                return null;
              }
            }
            return entry;
          }),
        ])
      ),
    ]);
  };
}
