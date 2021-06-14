import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('@rxap/plugin-readme-generator', () => {

  describe('Handlebars', () => {

    describe('Plugin', () => {

      let template: (data: any) => string;
      let data: any;

      beforeEach(() => {
        template = compile(readFileSync(join(__dirname, 'files', 'plugin', 'README.md.handlebars')).toString('utf-8'));
        data = {
          package: {
            name: '@rxap/test',
            description: 'description'
          },
          getstarted: null,
          guides: null,
          collection: {
            schematics: {
              config: {
                description: 'description'
              }
            }
          },
          builders: {
            builders: {}
          }
        };
      });

      it('should generate', () => {

        const readme = template(data);

        expect(readme).toEqual(`@rxap/test (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/test?style=flat-square)](https://www.npmjs.com/package/@rxap/test)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/test)
![npm](https://img.shields.io/npm/dm/@rxap/test)
![NPM](https://img.shields.io/npm/l/@rxap/test)

> description

- [Installation](#installation)

# Installation

Add the plugin to your workspace:

\`\`\`
yarn add @rxap/test
\`\`\`

*Configure the builder @rxap/test for a project:*

\`\`\`
ng g @rxap/test:config [project]
\`\`\`

> description

`);

      });

      it('should generate install command with rxap peerDependencies', () => {

        data.rxapDependencies = {
          '@rxap/sub1': '^12.4.0',
          '@rxap/sub2': '^12.1.1',
          '@rxap/sub3': '^12.2.3'
        };

        expect(template(data)).toMatch('yarn add @rxap/test @rxap/sub1@^12.4.0 @rxap/sub2@^12.1.1 @rxap/sub3@^12.2.3');

      });

      it('should use ng add instead of yarn add', () => {

        data.collection.schematics['ng-add'] = {
          description: 'description'
        };

        let readme = template(data);

        expect(readme).toMatch(`ng add @rxap/test`);
        expect(readme).not.toMatch('yarn add @rxap/test');

      });

      it('should add getstarted snipped', () => {

        data.getstarted = `GETSTRTED`;

        let readme = template(data);

        expect(readme).toMatch(`# Get started

GETSTRTED

`);

      });

      it('should add guides snipped', () => {

        data.guides = `GUIDES`;

        let readme = template(data);

        expect(readme).toMatch(`# Guides

GUIDES

`);

      });

      it('should add schematics description', () => {

        data.collection.schematics = {
          config: {
            description: 'description',
            name: data.package.name
          },
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description'
                }
              }
            }
          }
        };
        data.hasSchematics = true;

        let readme = template(data);

        expect(readme).toMatch('- [Schematics](#schematics)');

        expect(readme).toMatch(`# Schematics

## config
> description

\`\`\`
ng g @rxap/test:config
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---

## test
> description

\`\`\`
ng g @rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | description`);

      });

      it('should add schematics required options', () => {

        data.collection.schematics = {
          config: {
            description: 'description',
            name: data.package.name
          },
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description'
                }
              },
              required: [ 'project' ]
            }
          }
        };
        data.hasSchematics = true;

        let readme = template(data);

        expect(readme).toMatch(`# Schematics

## config
> description

\`\`\`
ng g @rxap/test:config
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---

## test
> description

\`\`\`
ng g @rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | description

| Required |
| --- |
| project |
`);

      });

      it('should add schematics default option', () => {

        data.collection.schematics = {
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description',
                  default: 'default'
                }
              }
            }
          }
        };
        data.hasSchematics = true;

        let readme = template(data);

        expect(readme).toMatch(`# Schematics

## test
> description

\`\`\`
ng g @rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string | default | description`);

      });

      it('should add builders description', () => {

        data.collection.schematics = {
          config: {
            description: 'description',
            name: data.package.name
          }
        };
        data.builders.builders = {
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description'
                }
              }
            }
          }
        };
        data.hasSchematics = true;
        data.hasBuilders = true;

        let readme = template(data);

        expect(readme).toMatch('- [Builder](#builder)');

        expect(readme).toMatch(`# Builder

## test
> description

**Builder name**
\`\`\`
@rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | description`);

      });

      it('should add builders required options', () => {

        data.collection.schematics = {
          config: {
            description: 'description',
            name: data.package.name
          }
        };
        data.builders.builders = {
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description'
                }
              },
              required: [ 'project' ]
            }
          }
        };
        data.hasSchematics = true;
        data.hasBuilders = true;

        let readme = template(data);

        expect(readme).toMatch(`# Builder

## test
> description

**Builder name**
\`\`\`
@rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | description

| Required |
| --- |
| project |
`);

      });

      it('should add builders default option', () => {

        data.collection.schematics = {
          config: {
            description: 'description',
            name: data.package.name
          }
        };
        data.builders.builders = {
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description',
                  default: 'default'
                }
              }
            }
          }
        };
        data.hasSchematics = true;
        data.hasBuilders = true;

        let readme = template(data);

        expect(readme).toMatch(`# Builder

## test
> description

**Builder name**
\`\`\`
@rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string | default | description`);

      });

    });

    describe('Library', () => {

      let template: (data: any) => string;
      let data: any;

      beforeEach(() => {
        template = compile(readFileSync(join(__dirname, 'files', 'library', 'README.md.handlebars')).toString('utf-8'));
        data = {
          package: {
            name: '@rxap/test',
            description: 'description'
          },
          getstarted: null,
          guides: null,
          collection: {
            schematics: {}
          }
        };
      });

      it('should generate', () => {

        const readme = template(data);

        expect(readme).toEqual(`@rxap/test
======

[![npm version](https://img.shields.io/npm/v/@rxap/test?style=flat-square)](https://www.npmjs.com/package/@rxap/test)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/test)
![npm](https://img.shields.io/npm/dm/@rxap/test)
![NPM](https://img.shields.io/npm/l/@rxap/test)

> description

- [Installation](#installation)

# Installation

\`\`\`
yarn add @rxap/test
\`\`\`

`);

      });

      it('should generate install command with rxap peerDependencies', () => {

        data.rxapDependencies = {
          '@rxap/sub1': '^12.4.0',
          '@rxap/sub2': '^12.1.1',
          '@rxap/sub3': '^12.2.3'
        };

        expect(template(data)).toMatch('yarn add @rxap/test @rxap/sub1@^12.4.0 @rxap/sub2@^12.1.1 @rxap/sub3@^12.2.3');

      });

      it('should use ng add instead of yarn add', () => {

        data.collection.schematics['ng-add'] = {
          description: 'description'
        };

        let readme = template(data);

        expect(readme).toMatch(`ng add @rxap/test`);
        expect(readme).not.toMatch('yarn add @rxap/test');

      });

      it('should add getstarted snipped', () => {

        data.getstarted = `GETSTRTED`;

        let readme = template(data);

        expect(readme).toMatch(`# Get started

GETSTRTED

`);

      });

      it('should add guides snipped', () => {

        data.guides = `GUIDES`;

        let readme = template(data);

        expect(readme).toMatch(`# Guides

GUIDES

`);

      });

      it('should add schematics description', () => {

        data.collection.schematics = {
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description'
                }
              }
            }
          }
        };
        data.hasSchematics = true;

        let readme = template(data);

        expect(readme).toMatch('- [Schematics](#schematics)');

        expect(readme).toMatch(`# Schematics

## test
> description

\`\`\`
ng g @rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | description`);

      });

      it('should add schematics required options', () => {

        data.collection.schematics = {
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description'
                }
              },
              required: [ 'project' ]
            }
          }
        };
        data.hasSchematics = true;

        let readme = template(data);

        expect(readme).toMatch(`# Schematics

## test
> description

\`\`\`
ng g @rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | description

| Required |
| --- |
| project |
`);

      });

      it('should add schematics default option', () => {

        data.collection.schematics = {
          test: {
            description: 'description',
            name: data.package.name,
            schema: {
              properties: {
                project: {
                  type: 'string',
                  description: 'description',
                  default: 'default'
                }
              }
            }
          }
        };
        data.hasSchematics = true;

        let readme = template(data);

        expect(readme).toMatch(`# Schematics

## test
> description

\`\`\`
ng g @rxap/test:test
\`\`\`

Option | Type | Default | Description
--- | --- | --- | ---
project | string | default | description`);

      });

    });

  });

});
