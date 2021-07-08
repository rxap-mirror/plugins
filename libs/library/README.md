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
ng add @rxap/plugin-library
```

> Setup the package @rxap/plugin-library for the workspace.


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
updatePackageGroup | boolean | true | Whether to add the update-package-group builder to the project
updatePeerDependencies | boolean | true | Whether to add the update-peer-dependencies for builder to the project

| Required |
| --- |
| project |

## config-update-package-group
> Adds @rxap/plugin-library:update-package-group builder to the specified project

```
ng g @rxap/plugin-library:config-update-package-group
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.

| Required |
| --- |
| project |

## config-update-peer-dependencies
> Adds the builder @rxap/plugin-library:update-peer-dependencies to the specified project.

```
ng g @rxap/plugin-library:config-update-peer-dependencies
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
ignore | array |  | A list of package name regex that should not be included as peer dependencies

| Required |
| --- |
| project |

## ng-add
> Setup the package @rxap/plugin-library for the workspace.

```
ng g @rxap/plugin-library:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | Name of the project

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
type | string |  | 

| Required |
| --- |
| tsConfig |
| outputPath |
| type |
## update-package-group
> Updates the package-group in the project package.json

**Builder name**
```
@rxap/plugin-library:update-package-group
```

Option | Type | Default | Description
--- | --- | --- | ---
## update-peer-dependencies
> Updates the package.json peerDependencies and will predict the next version of local dependencies.

**Builder name**
```
@rxap/plugin-library:update-peer-dependencies
```

Option | Type | Default | Description
--- | --- | --- | ---
ignore | array |  | A list of package name regex that should not be included as peer dependencies
dependencies | array |  | A list of package name should be included as dependencies
