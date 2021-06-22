import { chain, Rule } from '@angular-devkit/schematics';
import { ConfigUpdatePeerDependenciesSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: ConfigUpdatePeerDependenciesSchema): Rule {

  return async () => {

    return chain([
      UpdateAngularProject((project) => {

        if (!project.targets.has('update-peer-dependencies')) {
          project.targets.add('update-peer-dependencies', {
            builder: '@rxap/plugin-library:update-peer-dependencies',
            options: {
              ignore: options.ignore ?? []
            }
          });
        }

      }, {
        projectName: options.project
      })
    ]);

  };

}
