import { BuildersJsonType, GetProjectRoot, UpdateBuildersJson } from '@rxap/schematics-utilities';
import { join, normalize, relative } from 'path';
import { Rule } from '@angular-devkit/schematics';

export function CoerceBuildersJson(projectName: string): Rule {
  return tree => {
    const projectRoot = GetProjectRoot(tree, projectName);
    const relativePath = relative(normalize('/' + projectRoot), '/');
    return UpdateBuildersJson(collection => {
      if (!collection.builders) {
        collection.builders = {};
      }
      (collection as any)['$schema'] = join(relativePath, 'node_modules/@angular-devkit/architect/src/builders-schema.json');
    }, {
      type: BuildersJsonType.BUILDERS,
      create: true,
      projectName
    });
  };
}
