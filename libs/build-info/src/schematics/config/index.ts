import {
  chain,
  Rule,
  SchematicsException
} from '@angular-devkit/schematics';
import {
  updateWorkspace,
  updateNxJsonInTree
} from '@nrwl/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';

export default function(options: ConfigSchema): Rule {

  return async () => {

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (!project.targets.has('build-info')) {

          project.targets.add({
            name:    'build-info',
            builder: '@rxap/plugin-build-info:build',
            options: {}
          });

        }

        if (project.targets.has('build')) {
          const target = project.targets.get('build')!;
          target.options ??= {};
          target.options.assets ??= [];
          if (!project.sourceRoot) {
            throw new SchematicsException(`The project ${options.project} does not have a defined source root`);
          }
          const asset = join(project.sourceRoot, 'build.json');
          if (Array.isArray(target.options.assets) && !target.options.assets.includes(asset)) {
            target.options.assets.push(asset);
          }
          project.targets.set('build', target);
        }

      }),
      updateNxJsonInTree((json, context) => {
        json.targetDependencies ??= {};
        json.targetDependencies.build ??= [];
        if (!json.targetDependencies.build.find(dep => dep.target === 'build-info')) {
          json.targetDependencies.build.push({ target: 'build-info', projects: 'self' });
        }
        return json;
      })
    ]);

  };

}
