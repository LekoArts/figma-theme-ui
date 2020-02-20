import { convertLineHeight, convertFontWeight, convertFonts, findFigmaFont } from "../typography"

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
    expect(convertFonts(fonts, v => v)).toHaveProperty(
      `heading`,
      `-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial`
    )
  })
  test(`should use second arg (function) to change the values`, () => {
    expect(convertFonts(fonts, v => v.toUpperCase())).toStrictEqual({
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
