import { UpdateProjectPackageJson } from '@rxap/schematics-utilities';

export function CoerceBuilders(projectName: string) {
  return UpdateProjectPackageJson(packageJson => {
    packageJson.builders = './builders.json';
  }, { projectName: projectName });
}
