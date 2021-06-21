import { Rule } from '@angular-devkit/schematics';
import { join } from 'path';
import { GetProjectRoot } from '@rxap/schematics-utilities';

export function InitSrcFiles(projectName: string, type: 'schematics' | 'migrations' | 'builders'): Rule {
  return tree => {
    const projectRoot = GetProjectRoot(tree, projectName);
    const path = join(projectRoot, 'src', type, '.gitkeep');
    if (!tree.exists(path)) {
      tree.create(path, '');
    }
  };
}
