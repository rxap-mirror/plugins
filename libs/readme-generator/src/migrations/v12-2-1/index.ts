import { chain, Rule, schematic } from '@angular-devkit/schematics';
import { getWorkspace } from '@nrwl/workspace';

export default function(): Rule {

  return async host => {

    const workspace = await getWorkspace(host);

    return chain(Array.from(workspace
      .projects
      .entries())
      .filter(([ _, project ]) => project.targets.has('readme'))
      .map(([ name, project ]) => schematic('config', {
        project: name,
        overwrite: true,
        type: project.targets.get('readme')!.builder.match(/@rxap\/plugin-readme-generator:(.*)$/)[1]
      }))
    );

  };

}
