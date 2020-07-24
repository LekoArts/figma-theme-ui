import { convertColor, addColors, parseColors } from "../colors"
import { createSolidColor } from "../figma"

jest.mock(`../figma`)

const exampleColors = [
  {
    name: `white`,
    value: {
      a: 1,
      b: 1,
      g: 1,
      r: 1,
    },
  },
  {
    name: `black`,
    value: {
      a: 1,
      b: 0,
      g: 0,
      r: 0,
    },
  },
]

const toBeParsedColors = {
  background: `#fff`,
  text: `#000`,
  brand: {
    primary: `#663399`,
    secondary: `#000`,
  },
}

describe(`convertColor`, () => {
  test(`should return RGBA`, () => {
    expect(convertColor(`#663399`)).toEqual({
      a: 1,
      b: 0.6,
      g: 0.2,
      r: 0.4,
    })
  })
  test(`should work for "transparent"`, () => {
    expect(convertColor(`transparent`)).toEqual({
      a: 0,
      b: 0,
      g: 0,
      r: 0,
    })
  })
})

describe(`addColors`, () => {
  test(`calls createSolidColor correctly`, () => {
    addColors(exampleColors)
    expect(createSolidColor).toHaveBeenCalledWith(`white`, {
      a: 1,
      b: 1,
      g: 1,
      r: 1,
    })
    expect(createSolidColor).toHaveBeenCalledWith(`black`, {
      a: 1,
      b: 0,
      g: 0,
      r: 0,
    })
    expect(createSolidColor).toHaveBeenCalledTimes(2)
  })
})

describe(`parseColors`, () => {
  test(`should create an array of objects (in correct IThemeUIColor format)`, () => {
    expect(parseColors(toBeParsedColors)).toStrictEqual([
      {
        name: `background`,
        value: {
          a: 1,
          b: 1,
          g: 1,
          r: 1,
        },
      },
      {
        name: `text`,
        value: {
          a: 1,
          b: 0,
          g: 0,
          r: 0,
        },
      },
      {
        name: `brand/primary`,
        value: {
          a: 1,
          b: 0.6,
          g: 0.2,
          r: 0.4,
        },
      },
      {
        name: `brand/secondary`,
        value: {
          a: 1,
          b: 0,
          g: 0,
          r: 0,
        },
      },
    ])
  })
})
