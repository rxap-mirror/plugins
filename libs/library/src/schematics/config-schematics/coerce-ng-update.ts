import { UpdateProjectPackageJson } from '@rxap/schematics-utilities';

export function CoerceNgUpdate(projectName: string) {
  return UpdateProjectPackageJson(packageJson => {

    if (!packageJson['ng-update']) {
      packageJson['ng-update'] = {};
    }

    packageJson['ng-update'].migrations = './migration.json';

    if (!packageJson['ng-update'].packageGroup) {
      packageJson['ng-update'].packageGroup = [];
    }

    packageJson['ng-update'].packageGroup = [
      packageJson.name,
      ...packageJson['ng-update'].packageGroup
    ].filter((value, index, self) => self.indexOf(value) === index);

  }, { projectName: projectName });
}
