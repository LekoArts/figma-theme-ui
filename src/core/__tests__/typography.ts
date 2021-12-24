import {
  convertLineHeight,
  convertFontWeight,
  convertFonts,
  findFigmaFont,
  parseTypography,
  addTypography,
} from "../typography"
import { createFontStyle } from "../figma"

jest.mock(`../figma`, () => {
  const actual = jest.requireActual(`../figma`)
  return {
    ...actual,
    createFontStyle: jest.fn(),
  }
})

const fonts = {
  body: `-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial`,
  heading: `inherit`,
}

const figmaFontsSuccess = [
  {
    fontName: {
      family: `Segoe UI`,
      style: `Regular`,
    },
  },
  {
    fontName: {
      family: `Segoe UI`,
      style: `Bold`,
    },
  },
  {
    fontName: {
      family: `Roboto`,
      style: `Regular`,
    },
  },
]

const figmaFontsFail = [
  {
    fontName: {
      family: `Montserrat`,
      style: `Regular`,
    },
  },
  {
    fontName: {
      family: `Montserrat`,
      style: `Bold`,
    },
  },
]

const theme = {
  fonts: {
    body: `-apple-system, BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"`,
    heading: `inherit`,
  },
  fontSizes: [12, 14, 16, 20, 24, 32],
  fontWeights: {
    body: 400,
    heading: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
}

const minimalTheme = {
  fonts: {
    body: `-apple-system, BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif`,
    heading: `inherit`,
  },
  fontSizes: [12, 14, 16],
  fontWeights: {
    body: 400,
    heading: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
}

const parsedTheme = {
  fonts: {
    body: `Segoe UI`,
    heading: `Segoe UI`,
  },
  fontSizes: [12, 14, 16, 20, 24, 32],
  fontWeights: {
    body: 400,
    heading: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
}

describe(`convertLineHeight`, () => {
  test(`should process number values`, () => {
    expect(convertLineHeight(1.5)).toStrictEqual({
      value: 150,
      unit: `PERCENT`,
    })
  })
})

describe(`convertFontWeight`, () => {
  test(`should use dictionary to return correct Figma value`, () => {
    expect(convertFontWeight(200)).toEqual(`Thin`)
  })
})

describe(`convertFonts`, () => {
  test(`should handle "inherit" on heading`, () => {
    expect(convertFonts(fonts, (v) => v)).toHaveProperty(
      `heading`,
      `-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial`
    )
  })
  test(`should use second arg (function) to change the values`, () => {
    expect(convertFonts(fonts, (v) => v.toUpperCase())).toStrictEqual({
      body: `-APPLE-SYSTEM,"SEGOE UI",ROBOTO,"HELVETICA NEUE",ARIAL`,
      heading: `-APPLE-SYSTEM,"SEGOE UI",ROBOTO,"HELVETICA NEUE",ARIAL`,
    })
  })
})

describe(`findFigmaFont`, () => {
  test(`should return undefined when no match`, () => {
    expect(findFigmaFont(figmaFontsFail, fonts.body)).toBe(undefined)
  })
  test(`should return one result that is also first in the input font string`, () => {
    expect(findFigmaFont(figmaFontsSuccess, fonts.body)).toBe(`Segoe UI`)
    expect(findFigmaFont(figmaFontsSuccess, fonts.body)).not.toBe(`Roboto`)
  })
})

describe(`parseTypography`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-ignore
    global.figma = {
      listAvailableFontsAsync: jest.fn(() => [
        {
          fontName: {
            family: `Segoe UI`,
            style: `Regular`,
          },
        },
      ]),
    }
  })

  test(`should create parsed theme`, async () => {
    const THEME = await parseTypography(theme)
    // @ts-ignore
    expect(global.figma.listAvailableFontsAsync).toHaveBeenCalledTimes(1)
    expect(THEME).toStrictEqual(parsedTheme)
  })
})

describe(`addTypography`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-ignore
    global.figma = {
      listAvailableFontsAsync: jest.fn(() => [
        {
          fontName: {
            family: `Segoe UI`,
            style: `Regular`,
          },
        },
      ]),
      createTextStyle: jest.fn(() => ({
        name: ``,
        fontName: ``,
        fontSize: ``,
        lineHeight: ``,
      })),
      loadFontAsync: jest.fn(),
    }
  })

  test(`should work`, async () => {
    const modifiedConfig = await parseTypography(minimalTheme)
    await addTypography(modifiedConfig)
    // The "keys" are 2, the "fontSizes" are 3, so 2x3 in the two loops
    expect(createFontStyle).toHaveBeenCalledTimes(6)
    expect(createFontStyle).toHaveBeenNthCalledWith(1, `body-12`, `Segoe UI`, `Regular`, 12, {
      unit: `PERCENT`,
      value: 150,
    })
    expect(createFontStyle).toHaveBeenNthCalledWith(2, `body-14`, `Segoe UI`, `Regular`, 14, {
      unit: `PERCENT`,
      value: 150,
    })
    expect(createFontStyle).toHaveBeenNthCalledWith(3, `body-16`, `Segoe UI`, `Regular`, 16, {
      unit: `PERCENT`,
      value: 150,
    })
    expect(createFontStyle).toHaveBeenNthCalledWith(4, `heading-12`, `Segoe UI`, `Bold`, 12, {
      unit: `PERCENT`,
      value: 112.5,
    })
    expect(createFontStyle).toHaveBeenNthCalledWith(5, `heading-14`, `Segoe UI`, `Bold`, 14, {
      unit: `PERCENT`,
      value: 112.5,
    })
    expect(createFontStyle).toHaveBeenNthCalledWith(6, `heading-16`, `Segoe UI`, `Bold`, 16, {
      unit: `PERCENT`,
      value: 112.5,
    })
  })
})
