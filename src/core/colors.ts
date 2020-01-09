import parse from 'parse-color'

export const addColors = (colors: IThemeUIColor[]): void => {
  try {
    for (const { name, value } of colors) {
      createSolidColor(name, value)
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const createSolidColor = (name: string, color: RGBA): void => {
  const style = figma.createPaintStyle()

  figma.createPaintStyle
  style.name = name

  const { r, g, b, a } = color

  const rgbColor: RGB = { r, g, b }
  const alpha: number = a

  const solidPaint: SolidPaint = {
    type: 'SOLID',
    color: rgbColor,
    opacity: alpha,
  }

  style.paints = [solidPaint]
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
