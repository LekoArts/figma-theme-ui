interface IThemeUIColor {
  name: string
  value: RGBA
}

interface IMessage {
  type: 'CREATE_STYLES'
  payload: {
    options: {
      colors: boolean
      typography: boolean
      shadows: boolean
    }
    config: string
  }
}

declare module 'json5/dist/index.min.js'
declare module 'parse-color'
