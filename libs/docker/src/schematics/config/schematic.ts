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
import {
  GetProjectSourceRoot,
  UpdateJsonFile,
} from '@rxap/schematics-utilities';

export default function (options: ConfigSchema): Rule {
  return async (host: Tree) => {
    const projectSourceRoot = GetProjectSourceRoot(host, options.project);
    const dockerPath = join(projectSourceRoot, 'Dockerfile');

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('docker')) {
        } else {
          const targetOptions: any = {};

          if (options.dockerfile) {
            targetOptions.dockerfile = options.dockerfile;
          }

          if (options.imageSuffix) {
            targetOptions.imageSuffix = options.imageSuffix;
          }

          if (options.imageName) {
            targetOptions.imageName = options.imageName;
          }

          if (options.imageRegistry) {
            targetOptions.imageRegistry = options.imageRegistry;
          }

          if (options.context) {
            targetOptions.context = options.context;
          }

          if (options.command) {
            targetOptions.command = options.command;
          }

          const configurations: Record<string, { buildTarget?: string }> = {};

          if (options.buildTarget) {
            targetOptions.buildTarget = options.buildTarget;
          } else if (project.targets.has('build')) {
            const buildTarget = project.targets.get('build')!;

            for (const configuration in buildTarget.configurations) {
              configurations[configuration] = {};
            }
          }

          project.targets.add({
            name: 'docker',
            builder: `@rxap/plugin-docker:build`,
            options: targetOptions,
            configurations,
          });

          if (options.save) {
            project.targets.add({
              name: 'save',
              builder: `@rxap/plugin-docker:save`,
              options: {},
              configurations,
            });
          }
        }
      }),
      UpdateJsonFile((json) => {
        json.targetDependencies ??= {};
        json.targetDependencies.docker ??= [];
        if (
          !json.targetDependencies.docker.find((dep: any) =>
            typeof dep === 'string' ? dep === 'build' : dep.target === 'build'
          )
        ) {
          json.targetDependencies.docker.push({
            target: 'build',
            projects: 'self',
          });
        }
        if (
          !json.targetDependencies.docker.find((dep: any) =>
            typeof dep === 'string' ? dep === 'ci' : dep.target === 'ci'
          )
        ) {
          json.targetDependencies.docker.push({
            target: 'ci',
            projects: 'self',
          });
        }
        return json;
      }, 'nx.json'),
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
