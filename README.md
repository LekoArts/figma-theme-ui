# Theme UI Plugin for Figma

Convert a [Theme UI][theme-ui] config to [Figma Styles][figma-styles].

[Install the plugin](https://www.figma.com/c/plugin/797015796747379907)

## Usage

Choose a `.json` file that only contains your theme. Example:

```json
{
  "fonts": {
    "body": "-apple-system, BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'",
    "heading": "inherit"
  },
  "fontSizes": [12, 14, 16, 20, 24, 32],
  "fontWeights": {
    "body": 400,
    "heading": 700
  },
  "lineHeights": {
    "body": 1.5,
    "heading": 1.125
  },
  "colors": {
    "text": "rgb(0,0,0)",
    "background": "#fff",
    "brand": {
      "primary": "hsl(205, 100%, 40%)",
      "secondary": "#30c"
    },
    "teal": [null, "#e6fffa", "#b2f5ea", "#81e6d9"]
  }
}
```

The shape of the theme has to follow the [theme specification][theme-spec]. Otherwise the plugin can't find your styles. In your frontend code you can setup your bundler to be able to load `.json` files so that you can directly use it for your Theme UI config. This way the file is interchangeable.

More specifically, you'll need to bring the theme into the following shape (as shown above):

- `fonts`, `fontWeights` and `lineHeights` have to have the same keys (above: `body` and `heading`)
- `fontSizes` has to be defined as `Array<number>`
- `fontWeights` and `lineHeights` need to have a `number` as property

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

Go to your "Plugins" tab inside Figma and press the "+" button on "Development". Choose the `manifest.json` file inside `figma-theme-ui` folder.

You now can open the plugin in any project. Run `yarn dev` to have rollup watch your changes. You'll need to re-open the plugin after every change.

## Acknowledgements

- Thanks to [Figsvelte][figsvelte] for his cool boilerplate to start a Figma plugin with Svelte
- Thanks to [tailwindcss-figma-plugin][tw-plugin] for giving me an idea on how to use Figma's API

[theme-ui]: https://theme-ui.com/
[figma-styles]: https://help.figma.com/category/221-styles
[theme-spec]: https://theme-ui.com/theme-spec
[figsvelte]: https://github.com/thomas-lowry/figsvelte
[tw-plugin]: https://github.com/impulse/tailwindcss-figma-plugin
