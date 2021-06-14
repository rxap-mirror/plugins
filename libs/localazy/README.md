@rxap/plugin-localazy (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-localazy?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-localazy)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-localazy)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-localazy)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-localazy)

> A builder to execute a collection of architect targets in sequence.

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

Add the plugin to your workspace:

```
ng add @rxap/plugin-localazy
```

> Adds the localazy plugin to the workspace


*Configure the builder @rxap/plugin-localazy for a project:*

```
ng g @rxap/plugin-localazy:config [project]
```

> Adds the @plugin-pack:build to the specified project

# Schematics

## config

> Adds the @plugin-pack:build to the specified project

```
ng g @rxap/plugin-localazy:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
extractTarget | string |  | The target that extracts or generate the translation source file.

| Required |
| --- |
| project |

## ng-add

> Adds the localazy plugin to the workspace

```
ng g @rxap/plugin-localazy:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | Name of the project.
extractTarget | string |  | The target that extracts or generate the translation source file.

