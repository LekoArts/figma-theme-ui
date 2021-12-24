/* eslint-disable no-param-reassign */
import type { Theme } from "theme-ui"
import { string, number, object, array, record, union, optional, validate } from "superstruct"

const Fonts = record(string(), string())
const FontSizes = array(number())
const FontWeights = record(string(), number())
const LineHeights = record(string(), number())
const ColorProperties = union([string(), object(), array()])
const Colors = record(string(), ColorProperties)

export const parseConfig = (config: string, options: IOptions): Theme => {
  const result = JSON.parse(config)

  const hasTypography = options.typography
  const hasColors = options.colors

  const Schema = object({
    fonts: hasTypography ? Fonts : optional(Fonts),
    fontSizes: hasTypography ? FontSizes : optional(FontSizes),
    fontWeights: hasTypography ? FontWeights : optional(FontWeights),
    lineHeights: hasTypography ? LineHeights : optional(LineHeights),
    colors: hasColors ? Colors : optional(Colors),
  })

  const [error] = validate(result, Schema)

  if (error !== undefined) {
    figma.notify(
      `Error parsing your config. Have a look at the Console (Developer Tools) or open an issue on GitHub.`,
      { timeout: 10000 }
    )
    console.log(error.message)
    console.log(error)
    figma.closePlugin()
    return
  }

  return result
}
