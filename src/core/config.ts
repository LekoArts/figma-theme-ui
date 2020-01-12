import JSON5 from 'json5/dist/index.min.js'
import { Theme } from 'theme-ui'
import { struct } from 'superstruct'

const Fonts = struct.record(['string', 'string'])
const FontSizes = struct.array(['number'])
const FontWeights = struct.record(['string', 'number'])
const LineHeights = struct.record(['string', 'number'])
const ColorProperties = struct.union(['string', 'object', 'array'])
const Colors = struct.record(['string', ColorProperties])

export const parseConfig = (config: string, options: IOptions): Theme => {
  // Remove any whitespace
  config = config.replace(/("[^"\\]*(?:\\.[^"\\]*)*")|\s+/gm, '$1')
  // Backticks to double quotes
  config = config.replace(/`/g, '"')
  // Remove anything before module exports
  config = config.replace(/^(.*)(?=module.exports)/gi, '')
  // Remove module.exports=
  config = config.replace('module.exports=', '')
  // Parsed
  const parsed = JSON5.parse(config)
  const result = JSON.parse(JSON.stringify(parsed))

  const hasTypography = options.typography
  const hasColors = options.colors

  const Schema = struct.pick({
    fonts: hasTypography ? Fonts : struct.optional(Fonts),
    fontSizes: hasTypography ? FontSizes : struct.optional(FontSizes),
    fontWeights: hasTypography ? FontWeights : struct.optional(FontWeights),
    lineHeights: hasTypography ? LineHeights : struct.optional(LineHeights),
    colors: hasColors ? Colors : struct.optional(Colors),
  })

  const [error] = Schema.validate(result)

  if (error) {
    figma.notify(
      'Error parsing your config. Have a look at the Console (Developer Tools) or open an issue on GitHub.',
      { timeout: 10000 }
    )
    console.log(error.message)
    console.log(error)
    return
  }

  return result
}
