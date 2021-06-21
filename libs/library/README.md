@rxap/plugin-library (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-library?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-library)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-library)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-library)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-library)

> A Nx/Ng plugin for build many library types.

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:

```
yarn add @rxap/plugin-library @rxap/schematics-utilities@^12.0.5
```

*Configure the builder @rxap/plugin-library for a project:*

```
ng g @rxap/plugin-library:config [project]
```

> Adds @rxap/plugin-library builder to the specified project

# Schematics

## config-schematics

> Adds the builder @rxap/pack-library:build-schematics to the specified project

```
ng g @rxap/plugin-library:config-schematics
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
type | string |  |

| Required |
| --- |
| project |
| type |

## config

> Adds @rxap/plugin-library builder to the specified project

```
ng g @rxap/plugin-library:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
schematics | boolean | true | Whether to add the build-schematics for schematics
migrations | boolean | true | Whether to add the build-schematics for migrations
builders | boolean | false | Whether to add the build-schematics for builders

| Required |
| --- |
| project |

# Builder

## build-schematics
> Builds the library schematics and copy all files into the out path

**Builder name**

```
@rxap/plugin-library:build-schematics
```

Option | Type | Default | Description
--- | --- | --- | ---
tsConfig | string |  | The name of the Typescript configuration file.
outputPath | string |  | The output path of the generated files.
assets | array |  | List of static library assets.
type | string | schematics |

| Required |
| --- |
| tsConfig |
| outputPath |
