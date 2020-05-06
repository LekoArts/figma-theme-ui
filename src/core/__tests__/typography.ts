import { convertLineHeight, convertFontWeight, convertFonts, findFigmaFont, parseTypography } from "../typography"

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
