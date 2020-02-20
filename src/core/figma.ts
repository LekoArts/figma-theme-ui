/* istanbul ignore file */

export const createSolidColor = (name: string, color: RGBA): void => {
  const style = figma.createPaintStyle()

  style.name = name

  const { r, g, b, a } = color

  const rgbColor: RGB = { r, g, b }
  const alpha: number = a

  const solidPaint: SolidPaint = {
    type: `SOLID`,
    color: rgbColor,
    opacity: alpha,
  }

  style.paints = [solidPaint]
}

export const createFontStyle = async (
  name: string,
  family: string,
  style: string,
  fontSize: number,
  lineHeight: LineHeight
): Promise<void> => {
  const fontStyle = figma.createTextStyle()

  const fontName = {
    family,
    style,
  }

  await figma.loadFontAsync(fontName)

  fontStyle.name = name
  fontStyle.fontName = fontName
  fontStyle.fontSize = fontSize
  fontStyle.lineHeight = lineHeight
}
