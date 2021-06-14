import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { getWorkspace } from '@nrwl/workspace';

export default function(): Rule {

  return async host => {

    const workspace = await getWorkspace(host);

    return chain(Array.from(workspace
      .projects
      .keys())
      .filter((projectName) => workspace.projects.get(projectName).targets.has('readme'))
      .map(projectName => schematic('config', {
        project: projectName,
        overwrite: true
      }))
    );

  };

}
