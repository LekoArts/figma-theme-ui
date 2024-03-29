import { parseConfig } from "../config"

const configDefault = JSON.stringify({
  fonts: {
    body: `-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial`,
    heading: `inherit`,
    monospace: `Menlo,monospace`,
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  colors: {
    text: `#000`,
    cool: {
      one: `#f4f4f4`,
      two: `#f3f3f3`,
    },
    teal: [null, `#e6fffa`, `#b2f5ea`, `#81e6d9`, `#4fd1c5`, `#38b2ac`, `#319795`, `#2c7a7b`, `#285e61`, `#234e52`],
  },
})

const configColors = JSON.stringify({
  colors: {
    text: `#000`,
    cool: {
      one: `#f4f4f4`,
      two: `#f3f3f3`,
    },
    teal: [null, `#e6fffa`, `#b2f5ea`, `#81e6d9`, `#4fd1c5`, `#38b2ac`, `#319795`, `#2c7a7b`, `#285e61`, `#234e52`],
  },
})

const configTypography = JSON.stringify({
  fonts: {
    body: `-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial`,
    heading: `inherit`,
    monospace: `Menlo,monospace`,
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
})

const configInvalid = JSON.stringify({
  space: `test`,
})

describe(`parseConfig`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-ignore
    global.figma = {
      notify: jest.fn(),
      closePlugin: jest.fn(),
    }

    // @ts-ignore
    global.console = {
      log: jest.fn(),
    }
  })

  test(`should convert default config to valid config`, () => {
    expect(parseConfig(configDefault, { colors: true, typography: true, shadows: false })).toStrictEqual({
      fonts: {
        body: `-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial`,
        heading: `inherit`,
        monospace: `Menlo,monospace`,
      },
      fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
      fontWeights: {
        body: 400,
        heading: 700,
        bold: 700,
      },
      lineHeights: {
        body: 1.5,
        heading: 1.125,
      },
      colors: {
        text: `#000`,
        cool: {
          one: `#f4f4f4`,
          two: `#f3f3f3`,
        },
        teal: [null, `#e6fffa`, `#b2f5ea`, `#81e6d9`, `#4fd1c5`, `#38b2ac`, `#319795`, `#2c7a7b`, `#285e61`, `#234e52`],
      },
    })
  })
  test(`should convert config to object with only colors`, () => {
    expect(
      parseConfig(configColors, {
        colors: true,
        typography: false,
        shadows: false,
      })
    ).toStrictEqual({
      colors: {
        text: `#000`,
        cool: {
          one: `#f4f4f4`,
          two: `#f3f3f3`,
        },
        teal: [null, `#e6fffa`, `#b2f5ea`, `#81e6d9`, `#4fd1c5`, `#38b2ac`, `#319795`, `#2c7a7b`, `#285e61`, `#234e52`],
      },
    })
  })
  test(`should convert typography to object with only typography`, () => {
    expect(
      parseConfig(configTypography, {
        colors: false,
        typography: true,
        shadows: false,
      })
    ).toStrictEqual({
      fonts: {
        body: `-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial`,
        heading: `inherit`,
        monospace: `Menlo,monospace`,
      },
      fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
      fontWeights: {
        body: 400,
        heading: 700,
        bold: 700,
      },
      lineHeights: {
        body: 1.5,
        heading: 1.125,
      },
    })
  })
  test(`should throw error on completely invalid schema`, () => {
    parseConfig(configInvalid, { colors: true, typography: true, shadows: true })
    expect(global.console.log).toHaveBeenCalledTimes(2)
    // @ts-ignore
    expect(global.figma.notify).toHaveBeenCalledTimes(1)
    expect(
      // @ts-ignore
      global.figma.notify
    ).toHaveBeenCalledWith(
      `Error parsing your config. Have a look at the Console (Developer Tools) or open an issue on GitHub.`,
      { timeout: 10000 }
    )
    expect(
      // @ts-ignore
      global.figma.closePlugin
    ).toHaveBeenCalledTimes(1)
  })
  test(`should throw error on wrong colors schema`, () => {
    parseConfig(configTypography, { colors: true, typography: false, shadows: false })
    expect(global.console.log).toHaveBeenCalledTimes(2)
    // @ts-ignore
    expect(global.figma.notify).toHaveBeenCalledTimes(1)
    expect(
      // @ts-ignore
      global.figma.notify
    ).toHaveBeenCalledWith(
      `Error parsing your config. Have a look at the Console (Developer Tools) or open an issue on GitHub.`,
      { timeout: 10000 }
    )
    expect(
      // @ts-ignore
      global.figma.closePlugin
    ).toHaveBeenCalledTimes(1)
  })
  test(`should throw error on wrong typography schema`, () => {
    parseConfig(configColors, { colors: false, typography: true, shadows: false })
    expect(global.console.log).toHaveBeenCalledTimes(2)
    // @ts-ignore
    expect(global.figma.notify).toHaveBeenCalledTimes(1)
    expect(
      // @ts-ignore
      global.figma.notify
    ).toHaveBeenCalledWith(
      `Error parsing your config. Have a look at the Console (Developer Tools) or open an issue on GitHub.`,
      { timeout: 10000 }
    )
    expect(
      // @ts-ignore
      global.figma.closePlugin
    ).toHaveBeenCalledTimes(1)
  })
})
