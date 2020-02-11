import { Theme } from 'theme-ui'
import * as CSS from 'csstype'
import { createFontStyle } from './figma'
import { stringToArray } from './utils'

export const addTypography = async (THEME: Theme) => {
  const keys = Object.keys(THEME.fonts)

  for (let i = 0; i < keys.length; i++) {
    const name = keys[i]
    for (let k = 0; k < THEME.fontSizes.length; k++) {
      if (
        THEME.fonts[name] === undefined ||
        THEME.fontWeights[name] === undefined ||
        THEME.lineHeights[name] === undefined
      ) {
        continue
      }

      const fontStyleName = `${name}-${THEME.fontSizes[k]}`
      const family = THEME.fonts[name]
      const style = convertFontWeight(THEME.fontWeights[name])
      const fontSize = THEME.fontSizes[k] as number
      const lineHeight = convertLineHeight(THEME.lineHeights[name])

      await createFontStyle(fontStyleName, family, style, fontSize, lineHeight)
    }
  }
}

export const convertLineHeight = (lineHeight: number): LineHeight => {
  const valueInPercent = lineHeight * 100
  return {
    value: valueInPercent,
    unit: 'PERCENT',
  }
}

export const convertFontWeight = (fontWeight: number): string => {
  const dictNumerical = {
    100: 'ExtraLight',
    200: 'Thin',
    300: 'Light',
    400: 'Regular',
    500: 'Medium',
    600: 'Semibold',
    700: 'Bold',
    800: 'ExtraBold',
    900: 'Black',
  }

  return dictNumerical[fontWeight]
}

export const convertFonts = (
  fonts: {
    body: string
    heading?: string
    [K: string]: CSS.FontFamilyProperty
  },
  fn: (v: string, k: string, i: number) => unknown
) => {
  if (fonts.heading === 'inherit') {
    fonts.heading = fonts.body
  }

  return Object.fromEntries(
    Object.entries(fonts).map(([k, v], i) => [k, fn(v, k, i)])
  )
}

export const findFigmaFont = (
  figma: IFigmaFonts[],
  font: string
): string | undefined => {
  const figmaFonts = [...new Set(figma.map(e => e.fontName.family))]
  const configFonts = stringToArray(font)
  const foundFonts = configFonts.filter(f => figmaFonts.includes(f))

  if (foundFonts.length === 0) {
    return undefined
  }

  return foundFonts[0]
}

export const parseTypography = async (config: Theme) => {
  const figmaFonts = await figma.listAvailableFontsAsync()
  const configFonts = config.fonts
  //@ts-ignore
  const convertedFonts = convertFonts(configFonts, v =>
    findFigmaFont(figmaFonts, v)
  )

  const THEME = Object.assign(config, { fonts: convertedFonts })

  return THEME
}
