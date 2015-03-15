# virtualize-diff

Create a diff between two [virtualize](https://github.com/anthonyshort/virtualize) nodes.

```
npm install virtualize-diff
```

## Usage

```js
var node = require('virtualize').node;
var diff = require('virtualize-diff');

var left = node('h1', 'Hello World');
var right = node('h1', 'Hello Pluto');

var changes = diff(left, right);
```

```json
{
  path: '0.0',
  type: 'text.update',
  value: 'Hello Pluto'
}
```


