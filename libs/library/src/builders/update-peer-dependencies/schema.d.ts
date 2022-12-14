export interface UpdatePeerDependenciesBuilderSchema {
  ignore: string[];
  dependencies: string[];
  includeIndirectDependencies: boolean;
}
