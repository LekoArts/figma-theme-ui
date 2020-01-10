# Theme UI Plugin for Figma

Convert a [Theme UI][theme-ui] config to [Figma Styles][figma-styles].

## Usage

Choose a `.js` file that only contains an export and your theme. Example:

```js
module.exports = {
  colors: {
    text: '#000',
    cool: {
      one: '#f4f4f4',
      two: '#f3f3f3'
    },
    teal: [null, `#e6fffa`, `#b2f5ea`, `#81e6d9`, `#4fd1c5`, `#38b2ac`, `#319795`, `#2c7a7b`, `#285e61`, `#234e52`],
  }
}
```

The shape of the theme has to follow the [theme specification][theme-spec]. Otherwise the plugin can't find your styles.

Lastly, click "Add Styles" to create your Figma Styles.

## Development

Install the dependencies:

```sh
yarn install
```

And build the plugin:

```sh
yarn build
```

Go to your "Plugins" tab inside Figma and press the "+" button on "Development". Choose the `manifest.json` file inside `public` folder.

You now can open the plugin in any project. Run `yarn dev` to have rollup watch your changes. You'll need to re-open the plugin after every change.

## Acknowledgements

- Thanks to [Figsvelte][figsvelte] for his cool boilerplate to start a Figma plugin with Svelte
- Thanks to [tailwindcss-figma-plugin][tw-plugin] for giving me an idea on how to use Figma's API

[theme-ui]: https://theme-ui.com/
[figma-styles]: https://help.figma.com/category/221-styles
[theme-spec]: https://theme-ui.com/theme-spec
[figsvelte]: https://github.com/thomas-lowry/figsvelte
[tw-plugin]: https://github.com/impulse/tailwindcss-figma-plugin