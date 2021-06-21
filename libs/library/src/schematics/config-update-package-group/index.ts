import { chain, Rule } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: ConfigSchema): Rule {

  return () => {

    return chain([
      UpdateAngularProject((project) => {

        if (!project.targets.has('update-package-group')) {
          project.targets.add('update-package-group', {
            builder: '@rxap/plugin-library:update-package-group'
          });
        }

      }, {
        projectName: options.project
      })
    ]);

  };

}
