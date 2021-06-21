import { UpdateProjectPackageJson } from '@rxap/schematics-utilities';

export function CoerceSchematics(projectName: string) {
  return UpdateProjectPackageJson(packageJson => {
    packageJson.schematics = './collection.json';
  }, { projectName: projectName });
}
