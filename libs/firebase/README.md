@rxap/plugin-firebase
======

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-firebase?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-firebase)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-firebase)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-firebase)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-firebase)

> 

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

```
ng add @rxap/plugin-firebase
```

*Setup the package @rxap/plugin-firebase-functions for the workspace.*

# Schematics

## ng-add
> Setup the package @rxap/plugin-firebase-functions for the workspace.

```
ng g @rxap/plugin-firebase:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
init | boolean | true | Whether to initialize the firebase related projects and configurations
functions | boolean | false | Whether the functions project should be created


## init-functions
> Creates the firebase functions project

```
ng g @rxap/plugin-firebase:init-functions
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string | functions | The name of the functions project


## config-functions
> Configurate the functions project.

```
ng g @rxap/plugin-firebase:config-functions
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string | functions | The name of the functions project
initial | boolean | false | 

| Required |
| --- |
| project |

