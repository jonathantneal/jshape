# jshape [<img src="https://jonathantneal.github.io/js-logo.svg" alt="jshape" width="90" height="90" align="right">][jshape]

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Support Chat][git-img]][git-url]

[jshape] lets you shape any kind of value in JavaScript. It is ideal for
mocking, validating, and fixing potentially unreliable data, which makes it
both invaluable and unfortunate.

```js
const { asShape } = require('jshape');

asShape('true', Boolean); // returns true
asShape(true, String); // returns 'true'
asShape('5', Number); // returns 5
asShape(
  { name: 'Amelia', age: '5' },
  { name: String, age: Number }
); // returns { name: 'Amelia', age: 5 }
```

[jshape] is 610 bytes when minified and gzipped.

## Usage

Add [jshape] to your project:

```bash
npm install jshape --save
```

Use [jshape] to apply shapes to any value in JS:

```js
const { asShape } = require('jshape');

const currentYear = new Date().getFullYear();

const example = {
  titles: {
    0: { title: 'Something A', isSomething: '1', year: '2018' },
    1: { title: 'Something B', isSomething: null, year: '2018' },
    2: { title: 'Something C', isSomething: null }
  }
};

asShape(example, {
  titles: [{
    title: String,
    isSomething: Boolean,
    year: currentYear
  }]
}); /* returns {
  titles: [
    { title: 'Something A', isSomething: true, year: 2018 },
    { title: 'Something B', isSomething: false, year: 2018 },
    { title: 'Something C', isSomething: false, year: currentYear }
  ]
} */
```

[jshape] runs in all Node environements and browsers including Internet
Explorer 9+ without polyfills.

Test [jshape] in the browser:

```html
<script src="https://unpkg.com/jshape/jshape.js"></script>
```

A minified version is also available:

```html
<script src="https://unpkg.com/jshape/jshape.min.js"></script>
```

## Shapers

### asShape

Returns any value as a specific kind of value determined by a shape.

```js
const { asShape } = require('jshape');

asShape(value, shape, source);
```

- `value`: The value being guaranteed as a specific shape.
- `shape`: The function or value used to shape the value.
- `source`: The (optional) source being shaped, which is otherwise the value.

The `source` option is helpful when you want to create a new object, rather
than mutate the original.

##### asShape Usage

```js
const { asShape } = require('jshape');

asShape(objectNotBeingMutated, shape, { /* new object */ });
```

### asArray

Returns any value as an array, conditionally preserving the original array.

```js
const { asArray } = require('jshape');

asArray(value);
```

- `value`: The value being guaranteed as an array.

##### asArray Usage

```js
const { asArray } = require('jshape');

asArray({ 0: 'foo', 1: 'bar' }); // returns ['foo', 'bar']
```

## Primative Shapers

### asBoolean

Returns any value as a primative boolean.

```js
const { asBoolean } = require('jshape');

asBoolean(value);
```

- `value`: The value being guaranteed as a primative boolean.

##### asBoolean Usage

```js
const { asBoolean } = require('jshape');

asBoolean('1'); // returns true
asBoolean(1); // returns true
asBoolean(0); // returns false
asBoolean(NaN); // returns false
```

### asNumber

Returns any value as a primative number.

```js
const { asNumber } = require('jshape');

asNumber(value);
```

- `value`: The value being guaranteed as a primative number.

##### asNumber Usage

```js
const { asNumber } = require('jshape');

asNumber('1.337'); // returns 1.337
asNumber(true); // returns NaN
```

### asString

Returns any value as a primative string.

```js
const { asString } = require('jshape');

asString(value);
```

- `value`: The value being guaranteed as a primative string.

##### asString Usage

```js
const { asString } = require('jshape');

asString(null); // returns ''
asString(0); // returns '0'
asString(false); // returns 'false'
```

## Advanced Shaping

### asHashmap

Returns a hashmap shape for inner element shaping.

```js
const { asHashmap } = require('jshape');

asHashmap(shape);
asHashmap(shape, match);
```

- `shape`: The value being used to guarantee each element in the object hashmap.
- `match`: The (optional) pattern being used to shape hashmap keys.

##### asHashmap Usage

```js
const { asShape, asHashmap } = require('jshape');

asShape({ '111': '1', '222': 2, 'ccc': 3 }, asHashmap(Number, /^\d+$/));
/* returns {
  '111': 1,
  '222': 2
} */
```

### asOptional

Returns an optional shape for conditional shaping.

```js
const { asOptional } = require('jshape');

asOptional(shape);
```

- `shape`: The value used to conditionally shape another value.

##### asOptional Usage

```js
const { asShape, asOptional } = require('jshape');

asShape({ year: '2018' }, { year: asOptional(number) }) // returns { year: 2018 }
asShape({ year: null }, { year: asOptional(number) }) // returns { year: null }
```

## How things are shapes

### How Booleans are shaped

Booleans are shaped by the truthiness of a value. Values that are `false`, or
omitted, or that are `0`, `-0`, `null`, `false`, `NaN`, `undefined`, or an
empty string return a Boolean primative of `false`. All other values, including
any object or the string `"false"`, return a Boolean primative of `true`.

```js
const { asBoolean } = require('jshape');

asBoolean('1'); // returns true
asBoolean(1); // returns true
asBoolean(0); // returns false
asBoolean(NaN); // returns false
```

### How Numbers are shaped

Numbers are shaped by numeric conversion. All values are returned as the
numerified version of the value.

```js
const { asNumber } = require('jshape');

asNumber('1.337'); // returns 1.337
asNumber(true); // returns NaN
```

### How Strings are shaped

Strings are shaped by any identification. Values that are `null` or `undefined`
are returned as an empty string, and all other values are returned as the
stringified version of the value.

```js
const { asString } = require('jshape');

asString(null); // returns ''
asString(0); // returns '0'
asString(false); // returns 'false'
```

### How Arrays are shaped

Arrays are shaped by the iterableness of a value. Values that are Arrays are
returned as-is. Values that are array-like objects with a `length` property
return an Arrays of that length and their corresponding indexed elements.
Values that are array-like objects with indexed elements and no `length`
property are returned as Arrays with their length inferred by the length of the
value's own property names. Values that are `null` or `undefined` return an
empty Array, and all other values are returned as Array with one element which
is the value.

### How Hashmaps are shaped

Hashmaps are shaped by a shape and potentially a regular expression. Values are
converted into objects, with keys omitted that do not match their optional
regular expression.

```js
const { asShape, asHashmap } = require('jshape');

asShape({ '111': '1', '222': 2, 'ccc': 3 }, asHashmap(Number));
/* returns {
  '111': 1,
  '222': 2
  'ccc': 3
} */
```

```js
const { asShape, asHashmap } = require('jshape');

asShape({ '111': '1', '222': 2, 'ccc': 3 }, asHashmap(Number, /^\d+$/));
/* returns {
  '111': 1,
  '222': 2
} */
```

[cli-img]: https://img.shields.io/travis/jonathantneal/jshape.svg
[cli-url]: https://travis-ci.org/jonathantneal/jshape
[git-img]: https://img.shields.io/badge/support-chat-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[npm-img]: https://img.shields.io/npm/v/jshape.svg
[npm-url]: https://www.npmjs.com/package/jshape

[jshape]: https://github.com/jonathantneal/jshape
