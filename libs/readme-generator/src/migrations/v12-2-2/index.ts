import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { getWorkspace } from '@nrwl/workspace';

export default function(): Rule {

  return async host => {

    const workspace = await getWorkspace(host);

    return chain(Array.from(workspace
      .projects
      .entries())
      .filter(([ _, project ]) => project.targets.has('readme'))
      .map(([ name, project ]) => chain([
        (_, context) => {
          context.engine['_collectionCache'].delete('@rxap/plugin-readme-generator');
        },
        externalSchematic('@rxap/plugin-readme-generator', 'config', {
          project: name,
          overwrite: true,
          type: project.targets.get('readme')!.builder.match(/@rxap\/plugin-readme-generator:(.*)$/)[1]
        })
      ]))
    );

  };

}
