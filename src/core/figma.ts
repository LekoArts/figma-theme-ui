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
