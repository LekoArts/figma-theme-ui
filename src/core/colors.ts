import parse from "parse-color"
import { ColorMode } from "theme-ui"
import { createSolidColor } from "./figma"
import { flattenObject } from "./utils"

export const addColors = (colors: IThemeUIColor[]): void => {
  for (let i = 0; i < colors.length; i++) {
    createSolidColor(colors[i].name, colors[i].value)
  }
}

export const convertColor = (color: string): RGBA => {
  if (color === `transparent`) {
    // eslint-disable-next-line no-param-reassign
    color = `rgba(0, 0, 0, 0.0)`
  }

  const { rgba } = parse(color)

  return {
    r: rgba[0] / 255,
    g: rgba[1] / 255,
    b: rgba[2] / 255,
    a: rgba[3],
  }
}

export const parseColors = (colors: ColorMode): IThemeUIColor[] => {
  const flatColors = flattenObject(colors)
  return Object.keys(flatColors).map((key) => ({
    name: key,
    value: convertColor(flatColors[key]),
  }))
}
