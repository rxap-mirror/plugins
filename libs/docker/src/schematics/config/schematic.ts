import {
  chain,
  Rule,
  Tree,
  mergeWith,
  url,
  apply,
  move,
  applyTemplates,
  noop,
  forEach
} from '@angular-devkit/schematics';
import {
  updateWorkspace,
  updateNxJsonInTree
} from '@nrwl/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';
import { createDefaultPath } from '@schematics/angular/utility/workspace';

export default function(options: ConfigSchema): Rule {

  return async (host: Tree) => {

    const projectRootLibPath = await createDefaultPath(host, options.project as string);

    const projectRootPath    = join(projectRootLibPath, '../');
    const dockerPath = join(projectRootPath, 'Dockerfile');

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('docker')) {

        } else {

          const targetOptions: any = {}

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

          const configurations: Record<string, { buildTarget?: string }> = {};

          if (options.buildTarget) {
            targetOptions.buildTarget = options.buildTarget;
          } else if (project.targets.has('build')) {
            const buildTarget = project.targets.get('build')!;

            for (const configuration in buildTarget.configurations) {
              configurations[configuration] = {}
            }

          }

          project.targets.add({
            name:    'docker',
            builder: `@rxap/plugin-docker:build`,
            options: targetOptions,
            configurations
          });

        }

      }),
      updateNxJsonInTree((json, context) => {
        json.targetDependencies ??= {};
        json.targetDependencies.docker ??= [];
        if (!json.targetDependencies.docker.find(dep => typeof dep === 'string' ? dep === 'build' : dep.target === 'build')) {
          json.targetDependencies.docker.push({ target: 'build', projects: 'self' });
        }
        if (!json.targetDependencies.docker.find(dep => typeof dep === 'string' ? dep === 'ci' : dep.target === 'ci')) {
          json.targetDependencies.docker.push({ target: 'ci', projects: 'self' });
        }
        return json;
      }),
      host.exists(dockerPath) || options.dockerfile ?
      noop() :
      mergeWith(apply(url('./files'), [
        applyTemplates({}),
        move(projectRootPath),
        forEach(fileEntry => {
          if (host.exists(fileEntry.path)) {
            return null;
          }
          return fileEntry;
        })
      ]))
    ]);

  };

}
