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

export default function(options: ConfigSchema): Rule {

  return async () => {

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (!project.targets.has('ci')) {

          project.targets.add({
            name:    'ci',
            builder: '@rxap/plugin-build-info:build',
            options: {}
          });

        }

      }),
      updateNxJsonInTree((json, context) => {
        json.targetDependencies ??= {};
        json.targetDependencies.ci ??= [];
        if (!json.targetDependencies.ci.find(dep => dep.target === 'build')) {
          json.targetDependencies.ci.push({ target: 'build', projects: 'self' });
        }
        return json;
      })
    ]);

  };

}
