import { chain, externalSchematic, Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';
import { UpdateAngularProject } from '@rxap/schematics-utilities';

export default function(options: ConfigSchema): Rule {

  return async (host: Tree) => {

    return chain([
      UpdateAngularProject((project) => {
        if (!project.targets.has('replace')) {

          project.targets.add('replace', {
            builder: '@rxap/plugin-file-replacer:file-replacer',
            options: {
              files: {}
            }
          });

        } else {
          console.warn(`The project '${options.project}' has already the builder replace.`);
        }

      }, { projectName: options.project }),
    ]);

  };

}
