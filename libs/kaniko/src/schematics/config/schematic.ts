import {
  apply,
  applyTemplates,
  chain,
  forEach,
  mergeWith,
  move,
  noop,
  Rule,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nx/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';
import { GetProjectSourceRoot } from '@rxap/schematics-utilities';

export default function (options: ConfigSchema): Rule {
  return async (host: Tree) => {
    const projectSourceRoot = GetProjectSourceRoot(host, options.project);
    const dockerPath = join(projectSourceRoot, 'Dockerfile');

    let hasCiTarget = false;

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        hasCiTarget = project.targets.has('ci');

        if (project.targets.has('kaniko')) {
        } else {
          const targetOptions: any = {};

          if (options.dockerfile) {
            targetOptions.dockerfile = options.dockerfile;
          }

          if (options.destination?.length) {
            targetOptions.destination = options.destination;
          }

          if (options.context) {
            targetOptions.context = options.context;
          }

          if (options.command) {
            targetOptions.command = options.command;
          }

          if (options.latest) {
            targetOptions.latest = options.latest;
          }

          if (options.cache) {
            targetOptions.cache = options.cache;
          }

          const configurations: Record<string, { buildTarget: string }> = {};

          if (options.buildTarget) {
            targetOptions.buildTarget = options.buildTarget;
          } else if (project.targets.has('build')) {
            const buildTarget = project.targets.get('build')!;
            targetOptions.buildTarget = `${options.project}:build`;

            for (const configuration in buildTarget.configurations) {
              configurations[configuration] = {
                buildTarget: `${options.project}:build:${configuration}`,
              };
            }
          }

          project.targets.add({
            name: 'kaniko',
            builder: `@rxap/plugin-kaniko:build`,
            options: targetOptions,
            configurations,
          });
        }
      }),
      host.exists(dockerPath) || options.dockerfile
        ? noop()
        : mergeWith(
            apply(url('./files'), [
              applyTemplates({}),
              move(projectSourceRoot),
              forEach((fileEntry) => {
                if (host.exists(fileEntry.path)) {
                  return null;
                }
                return fileEntry;
              }),
            ])
          ),
    ]);
  };
}
