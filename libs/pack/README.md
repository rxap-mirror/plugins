@rxap/plugin-pack (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-pack?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-pack)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-pack)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-pack)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-pack)

> A builder to execute a collection of architect targets in sequence.

- [Installation](#installation)
- [Schematics](#schematics)
- [Builder](#builder)

# Installation

Add the plugin to your workspace:

```
ng add @rxap/plugin-pack
```

> Adds the pack plugin to the workspace


*Configure the builder @rxap/plugin-pack for a project:*

```
ng g @rxap/plugin-pack:config [project]
```

> Adds the @plugin-pack:build to the specified project

# Schematics

## config
> Adds the @plugin-pack:build to the specified project

```
ng g @rxap/plugin-pack:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.

| Required |
| --- |
| project |

## add-target
> Adds a target to the targets options array

```
ng g @rxap/plugin-pack:add-target
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
target | string |  | The target expression that should be added
preBuild | boolean | false | Whether the target should be added before the build targets

| Required |
| --- |
| project |
| target |

## ng-add
> Adds the pack plugin to the workspace

```
ng g @rxap/plugin-pack:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | Name of the project.

# Builder

## build
> build builder

**Builder name**
```
@rxap/plugin-pack:build
```

Option | Type | Default | Description
--- | --- | --- | ---
targets | array |  | A list of architect targets
