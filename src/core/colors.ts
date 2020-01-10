import parse from 'parse-color'
import { createSolidColor } from './figma'

export const addColors = (colors: IThemeUIColor[]): void => {
  try {
    for (const { name, value } of colors) {
      createSolidColor(name, value)
    }
  } catch (error) {
    throw new Error('addColors: Invalid input format')
  }
}

export const convertColor = (color: string): RGBA => {
  if (color === 'transparent') {
    color = 'rgba(0, 0, 0, 0.0)'
  }

  const { rgba } = parse(color)

  return {
    r: rgba[0] / 255,
    g: rgba[1] / 255,
    b: rgba[2] / 255,
    a: rgba[3],
  }
}
