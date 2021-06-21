import { CollectionJsonType, GetProjectRoot, UpdateCollectionJson } from '@rxap/schematics-utilities';
import { join, normalize, relative } from 'path';
import { Rule } from '@angular-devkit/schematics';

export function CoerceMigrationJson(projectName: string): Rule {
  return tree => {
    const projectRoot = GetProjectRoot(tree, projectName);
    const relativePath = relative(normalize('/' + projectRoot), '/');
    return UpdateCollectionJson(collection => {
      if (!collection.schematics) {
        collection.schematics = {};
      }
      (collection as any)['$schema'] = join(relativePath, 'node_modules/@angular-devkit/schematics/collection-schema.json');
    }, {
      type: CollectionJsonType.MIGRATIONS,
      create: true,
      projectName
    });
  };
}
