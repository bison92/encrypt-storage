# Encrypt Storage
[![npm](https://img.shields.io/npm/dm/encrypt-storage)](https://www.npmjs.com/package/encrypt-storage) [![Code Size](https://img.shields.io/github/languages/code-size/michelonsouza/encrypt-storage)](https://github.com/michelonsouza/encrypt-storage) [![Version](https://img.shields.io/github/package-json/v/michelonsouza/encrypt-storage/master)](https://github.com/michelonsouza/encrypt-storage/blob/master/package.json) [![Build Status](https://img.shields.io/github/workflow/status/michelonsouza/encrypt-storage/NodeJS%20CI)](https://img.shields.io/github/workflow/status/michelonsouza/encrypt-storage/NodeJS%20CI) [![Coverage Status](https://coveralls.io/repos/github/michelonsouza/encrypt-storage/badge.svg)](https://coveralls.io/github/michelonsouza/encrypt-storage) [![License](https://img.shields.io/npm/l/encrypt-storage?color=%230e7fc0&label=license)](https://github.com/michelonsouza/encrypt-storage/blob/master/LICENSE) [![npm published](https://github.com/michelonsouza/encrypt-storage/actions/workflows/release.yml/badge.svg)](https://github.com/michelonsouza/encrypt-storage/actions/workflows/release.yml)

OBS: This is the new version of Encrypt Storage, it has braking changes that will not be described below. For version `1.3.X` documentation, access this [link](./docs/README_V1.md).

The `Encrypt Storage` is a `wrapper` for native `Storage` of browser.

Using the `crypto-js` library as an encryption engine, it saves the encrypted data on the `selected storage` in the same way as the native `Storage`.

> NOTE: Nothing on the front end is entirely secure. The library's proposal is to make it difficult for the user to see the data through the console, but as the secret key is on the front end, if the user searches hard enough, he will end up finding it. Just to make it clear that nothing is completely secure on the front end. Thank you for your attention.

- [Encrypt Storage](#encrypt-storage)
  - [Features](#features)
  - [Installing](#installing)
  - [Options](#options)
  - [Usage](#usage)
    - [Conventions](#conventions)
    - [Parameters](#parameters)
    - [CommonJS](#commonjs)
    - [JS Import (ES6+)](#js-import-es6)
    - [Multiple instances](#multiple-instances)
    - [Options implementation](#options-implementation)
      - [*prefix*](#prefix)
      - [*storageType*](#storagetype)
      - [*stateManagementUse*](#statemanagementuse)
      - [*encAlgorithm*](#encalgorithm)
    - [Methods](#methods)
      - [*setItem*](#setitem)
      - [*getItem*](#getitem)
      - [*removeItem*](#removeitem)
      - [*getItemFromPattern*](#getitemfrompattern)
      - [*removeItemFromPattern*](#removeitemfrompattern)
      - [*key*](#key)
      - [*length*](#length)
      - [*clear*](#clear)
      - [*encryptString*](#encryptstring)
      - [*decryptString*](#decryptstring)
    - [AsyncEncryptStorage](#asyncencryptstorage)
    - [AWS Amplify](#aws-amplify)
    - [State Management Persisters](#state-management-persisters)
      - [*vuex-persist*](#vuex-persist)
      - [*redux-persist*](#redux-persist)
- [License](#license)

## Features
  - Save encrypted data in `localStorage` and `sessionStorage`
  - Recover encrypted data with `get` functions
  - Use in the same way as native `Web Storage` (localStorage and sessionStorage)
  - If you use the `stateManagementUse` option, the data acquired in `get` functions will `not` have their return transformed into `Javascript objects`.
  - Use with `stateManagement` persisters (`vuex-persist` and `redux-persist`*)

## Installing

> To run this project in the development mode, you'll need to have a basic environment with NodeJs and Yarn installed.

Using npm:

```bash
$ npm install encrypt-storage
```

Or yarn:

```bash
$ yarn add encrypt-storage
```

## Options

The `options` object is optional and consists of the following properties:

|propertie          |type                                       |default        |
|-------------------|-------------------------------------------|---------------|
|prefix             |`string`                                   |`''`           |
|storageType        |`localStorage` or `sessionStorage`         |`localStorage` |
|stateManagementUse |`boolean`                                  |`false`        |
|encAlgorithm       |`AES` \| `Rabbit` \| `RC4` \| `RC4Drop`    |`AES`          |

## Usage

### Conventions

Create a `file` containing the `EncryptStorage` instance in a `utils` folder or folder of your choice. It is recommended to use it as a `singleton` for better use of the library.

> Directory Layout
```
📦 src
 ┣ 📂 utils
 ┃ ┗ 📜 storage.ts
 ┗ 📜 index.ts
 ...
```

### Parameters

*secretKey*: **required** = A string containing at least 10 characters;

**NOTE**: If you are using a `SPA` model (vue, react or angular) prefer to store this information in your application's `.env` file.

*options*: **optional** = An object as described above and which will be shown below;
### CommonJS

```typescript
const { EncryptStorage } = require('encrypt-storage');

// Example of secret_key variable in an .env file
// const encryptStorage = new EncryptStorage(process.env.SECRET_KEY, options);
const encryptStorage = new EncryptStorage('secret-key', options);

module.exports = encryptStorage
```

### JS Import (ES6+)

```typescript
import { EncryptStorage } from 'encrypt-storage';

// Example of secret_key variable in an .env file
// const encryptStorage = new EncryptStorage(process.env.SECRET_KEY, options);
export const encryptStorage = new EncryptStorage('secret-key', options);
```

### Multiple instances

To use `multiple instances`, it is `strictly necessary` to pass the `prefix` to `all` of them. As shown below:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage1 = new EncryptStorage('secret-key', {
  prefix: '@instance1',
});

export const encryptStorage2 = new EncryptStorage('secret-key', {
  prefix: '@instance2',
});

encryptStorage1.setItem('any-key', 'any-value');
encryptStorage2.setItem('any-key', 'any-value');
```

in your `storage`:

|Key                   |Value                                      |
|----------------------|-------------------------------------------|
|`@instance1:any-key`  |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |
|`@instance2:any-key`  |`U2FsdGVkX1/w4QaIcyq5521ZXB5pqw2KEwOH+`... |

### Options implementation

#### *prefix*

default `''` - is optional and is the prefix of all keys used in the selected storage as shown below:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key', {
  prefix: '@example',
});
```

#### *storageType*

default `localStorage` - is the type of storage that will be used, at the moment only `localStorage` and `sessionStorage` are allowed:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key', {
  storageType: 'sessionStorage',
});
```

#### *stateManagementUse*

**NOTE**: This property is also `required` for completely `identical` use to the browser's native. Therefore, it will `not` have the native library behavior when `parsing` data to `javascript objects` or type casting such as `'true'` being a `boolean`, `'2'` being a `number`, etc.

default `false` - is a `boolean` value that, when true allows the use of it with `vuex-persist` and `redux-persist`:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key', {
  stateManagementUse: true,
});
```

#### *encAlgorithm*

default `AES` - Is the selected encryption algorithm.:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key', {
  encAlgorithm: 'Rabbit',
});
```

### Methods

From here, we will have the following code as the EncryptStorage instance model:

```typescript
import { EncryptStorage } from 'encrypt-storage';

export const encryptStorage = new EncryptStorage('secret-key', {
  prefix: '@example',
});
```

#### *setItem*
Add `key` and `encrypted` value to selected `storage`.

```typescript
encryptStorage.setItem('token', 'edbe38e0-748a-49c8-9f8f-b68f38dbe5a2');
```

in your `storage`:

|Key               |Value                                      |
|------------------|-------------------------------------------|
|`@example:token`  |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

#### *getItem*
Returns the value `decrypted` or `undefined` by the `key` passed by `parameter`. Default type is `any`;

**NOTE**: It is possible to pass a `generics` (typescript case) to obtain a consistent and typed return for better use in the `typescript`.

```typescript
const value = encryptStorage.getItem<T = any>('token');
```

result of `getItem`:
```bash
'edbe38e0-748a-49c8-9f8f-b68f38dbe5a2'
```

#### *removeItem*
Remove item from selected `storage`.

in your `storage`:

|Key               |Value                                      |
|------------------|-------------------------------------------|
|`@example:token`  |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |


```typescript
encryptStorage.removeItem('token');
```

now in your `storage`:

|Key               |Value                                      |
|------------------|-------------------------------------------|
|` `               |` `                                        |

#### *getItemFromPattern*
Returns an `object` containing the `original` keys (no prefix) and `decrypted` values or `undefined` when no value found.

in your `storage`:

|Key               |Value                                                   |
|-------------------------------|-------------------------------------------|
|`@example:fruit:apple`         |`U2FsdGVkX1/2KEwOH+w4QaIc`                 |
|`@example:fruit:grape`         |`U2FsdGVkX1/yq5521ZXB5pqw`                 |
|`@example:vegetable:lettuce`   |`U2FsdGVkX1/tT67hnb*\afcb`                 |
|`@example:token`               |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |


```typescript
const values = encryptStorage.getItemFromPattern('fruit');
```

result of `getItemFromPattern`:
```typescript
const values = {
  'fruit:apple': 'apple',
  'fruit:grape': 'grape',
}
```

#### *removeItemFromPattern*
Removes `all` items that have the `pattern` passed by `parameter` from the selected `storage`.

in your `storage`:

|Key               |Value                                                   |
|-------------------------------|-------------------------------------------|
|`@example:fruit:apple`         |`U2FsdGVkX1/2KEwOH+w4QaIc`                 |
|`@example:fruit:grape`         |`U2FsdGVkX1/yq5521ZXB5pqw`                 |
|`@example:vegetable:lettuce`   |`U2FsdGVkX1/tT67hnb*\afcb`                 |
|`@example:token`               |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |


```typescript
encryptStorage.removeItemFromPattern('fruit');
```

now in your `storage`:

|Key               |Value                                                   |
|-------------------------------|-------------------------------------------|
|`@example:vegetable:lettuce`   |`U2FsdGVkX1/tT67hnb*\afcb`                 |
|`@example:token`               |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

#### *key*
Returns the `key` corresponding to the `index` passed by `parameter` or `null`.

in your `storage`:

|Key                            |Value                                      |
|-------------------------------|-------------------------------------------|
|`@example:vegetable:lettuce`   |`U2FsdGVkX1/tT67hnb*\afcb`                 |
|`@example:token`               |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |


```typescript
const key = encryptStorage.key(0);
```

result of `key`:
```bash
'@example:vegetable:lettuce'
```

#### *length*
Returns the `amount` of values from the selected `storage`.

in your `storage`:

|Key                            |Value                                      |
|-------------------------------|-------------------------------------------|
|`@example:vegetable:lettuce`   |`U2FsdGVkX1/tT67hnb*\afcb`                 |
|`@example:token`               |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |

```typescript
const length = encryptStorage.length;
```

result of `length`:
```bash
2
```

#### *clear*
Removes `all` keys and values from the selected `storage`.

in your `storage`:

|Key                            |Value                                      |
|-------------------------------|-------------------------------------------|
|`@example:vegetable:lettuce`   |`U2FsdGVkX1/tT67hnb*\afcb`                 |
|`@example:token`               |`U2FsdGVkX1/2KEwOH+w4QaIcyq5521ZXB5pqw`... |


```typescript
encryptStorage.clear();
```

now in your `storage`:

|Key               |Value                                      |
|------------------|-------------------------------------------|
|` `               |` `                                        |

#### *encryptString*
Encrypts a `string` passed by `parameter`.

```typescript
const value = encryptStorage.encryptString('John Doe');
```

result of `encryptString`:
```typescript
const value = 'U2FsdGVkX1/tT67hnb*\afcb';
```

#### *decryptString*
Decrypts a `string` passed by `parameter`.

```typescript
const value = encryptStorage.decryptString('U2FsdGVkX1/tT67hnb*\afcb');
```

result of `decryptString`:
```typescript
const value = 'John Doe';
```

### AsyncEncryptStorage

EncryptStorage can also be used asynchronously, simply using its corresponding version already exported by the library.

**NOTE**: This functionality has its usefulness revealed in the context of redux-persist, shown below.

example:

```typescript
import { AsyncEncryptStorage } from 'encrypt-storage';

export const encryptStorage = new AsyncEncryptStorage('secret-key', options);

async function getDecryptedValue('key'): Promise<any | undefined> {
  const value = await encryptStorage.getItem('key');
}
```

### AWS Amplify

In the case of `aws-amplify`, if you want to use the facility of not needing to use `JSON.parse` in the rest of the application, prefer to create an instance within the `amplify` configuration file, as follows:

```typescript
import Amplify from 'aws-amplify';
import { EncryptStorage } from 'encrypt-storage';

const encryptStorage = new EncryptStorage('secret_key', {
  ...,
  stateManagementUse: true,
});

...

Amplify.configure({
  Auth: {
    ...,
    storage: encryptStorage,
  },
});
```

### State Management Persisters

This library can be used to encrypt data from `state management persisters` like [vuex-persist](https://www.npmjs.com/package/vuex-persist) and [redux-persist](https://www.npmjs.com/package/redux-persist). Below are their respective implementations:

**NOTE**: the `stateManagementUse` option must be used in the `EncryptStorage` instance to work `correctly`.

#### *vuex-persist*

```typescript
import VuexPersistence from 'vuex-persist';

import { encryptStorage } from 'path/to/encryptStorage';

const vuexLocal = new VuexPersistence<RootState>({
  storage: encryptStorage,
});
```

#### *redux-persist*

**NOTE**: In the case of `redux-persist` it is `necessary` to use an `asynchronous` implementation, already provided by `EncryptStorage`.

```typescript
// ...
import { AsyncEncryptStorage } from 'encrypt-storage';

export const encryptStorage = new AsyncEncryptStorage('secret-key', options);

const persistConfig = {
  key: 'root',
  storage: encryptStorage,
  whitelist: ['navigation'],
  ...
};
```

# License

[MIT License](/LICENSE)
