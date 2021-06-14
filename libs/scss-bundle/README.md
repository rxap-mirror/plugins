@rxap/plugin-scss-bundle (Nx/Ng Plugin)
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-scss-bundle?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-scss-bundle)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-scss-bundle)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-scss-bundle)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-scss-bundle)

> A builder to bundle scss theme files for angular libraries.

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

Add the plugin to your workspace:

```
yarn add @rxap/plugin-scss-bundle
```

*Configure the builder @rxap/plugin-scss-bundle for a project:*

```
ng g @rxap/plugin-scss-bundle:config [project]
```

> Adds the @plugin-scss-bundle:build to the specified project

# Schematics

## config

> Adds the @plugin-scss-bundle:build to the specified project

```
ng g @rxap/plugin-scss-bundle:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.

| Required |
| --- |
| project |

