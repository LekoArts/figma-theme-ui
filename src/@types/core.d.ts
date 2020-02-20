interface IThemeUIColor {
  name: string
  value: RGBA
}

interface IOptions {
  colors: boolean
  typography: boolean
  shadows: boolean
}

interface IMessage {
  type: "CREATE_STYLES"
  payload: {
    options: IOptions
    config: string
  }
}

interface IFigmaFonts {
  fontName: {
    family: string
    style: string
  }
}

declare module "json5/dist/index.min.js"
declare module "parse-color"
