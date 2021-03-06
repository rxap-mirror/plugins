export interface ConfigSchema {
  project: string;
  schematics: boolean;
  builders: boolean;
  migrations: boolean;
  updatePackageGroup: boolean;
  updatePeerDependencies: boolean;
}
