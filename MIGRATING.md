# Migration Guide

## Migrating from v1 to v2

Let's say you have this partial config (following the Theme UI spec) for your "colors" named `colors.js`:

```js
module.exports = {
  colors: {
    text: `#000`,
    cool: {
      one: `#f4f4f4`,
      two: `#f3f3f3`,
    },
    teal: [null, `#e6fffa`, `#b2f5ea`, `#81e6d9`, `#4fd1c5`, `#38b2ac`, `#319795`, `#2c7a7b`, `#285e61`, `#234e52`],
  },
}
```

You'll need to convert this file to a valid JSON file named `colors.json`:

```json
{
  "colors": {
    "text": "#000",
    "cool": {
      "one": "#f4f4f4",
      "two": "#f3f3f3"
    },
    "teal": [null, "#e6fffa", "#b2f5ea", "#81e6d9", "#4fd1c5", "#38b2ac", "#319795", "#2c7a7b", "#285e61", "#234e52"]
  }
}
```

You can use a [JSON validator](https://jsonformatter.curiousconcept.com) to check your JSON. In your frontend code (depending on your bundler/framework setup) you can now import the `colors.json` and use it instead of your previous JavaScript file.

The same pattern also applies to a `config.js` you might have with a full Theme UI config. You'll need to convert the JavaScript object to a valid JSON file and use that starting with v2.