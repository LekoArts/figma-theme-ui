import { parseConfig } from '../config'

// @ts-ignore
global.figma = {
  notify: jest.fn(() => 'Test return'),
  closePlugin: jest.fn(() => 'Plugin closed'),
}

const binaryStr = `
module.exports = {
  fonts: {
    body: '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial',
    heading: 'inherit',
    monospace: 'Menlo,monospace',
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
    text: '#000',
    cool: {
      one: '#f4f4f4',
      two: '#f3f3f3'
    },
    teal: [null, '#e6fffa', '#b2f5ea', '#81e6d9', '#4fd1c5', '#38b2ac', '#319795', '#2c7a7b', '#285e61', '#234e52'],
  }
}
`

const binaryStrSemiWhitespace = `
module.exports = {
  fonts: {
    body: '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial',
    heading: 'inherit',
    monospace: 'Menlo,monospace',
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
    text: '#000',
    cool: {
      one: '#f4f4f4',
      two: '#f3f3f3'
    },
    teal: [null, '#e6fffa', '#b2f5ea', '#81e6d9', '#4fd1c5', '#38b2ac', '#319795', '#2c7a7b', '#285e61', '#234e52'],
  }
};

`

const binaryStrColors = `
module.exports = {
  colors: {
    text: '#000',
    cool: {
      one: '#f4f4f4',
      two: '#f3f3f3'
    },
    teal: [null, '#e6fffa', '#b2f5ea', '#81e6d9', '#4fd1c5', '#38b2ac', '#319795', '#2c7a7b', '#285e61', '#234e52'],
  }
}
`

const binaryStrTypo = `
module.exports = {
  fonts: {
    body: '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial',
    heading: 'inherit',
    monospace: 'Menlo,monospace',
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
}
`

describe('parseConfig', () => {
  test('should convert binaryStr to object', () => {
    expect(
      parseConfig(binaryStr, { colors: true, typography: true, shadows: false })
    ).toStrictEqual({
      fonts: {
        body: '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial',
        heading: 'inherit',
        monospace: 'Menlo,monospace',
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
        text: '#000',
        cool: {
          one: '#f4f4f4',
          two: '#f3f3f3',
        },
        teal: [
          null,
          '#e6fffa',
          '#b2f5ea',
          '#81e6d9',
          '#4fd1c5',
          '#38b2ac',
          '#319795',
          '#2c7a7b',
          '#285e61',
          '#234e52',
        ],
      },
    })
  })
  test('should handle whitespace and semicolons', () => {
    expect(
      parseConfig(binaryStrSemiWhitespace, { colors: true, typography: true, shadows: false })
    ).toStrictEqual({
      fonts: {
        body: '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial',
        heading: 'inherit',
        monospace: 'Menlo,monospace',
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
        text: '#000',
        cool: {
          one: '#f4f4f4',
          two: '#f3f3f3',
        },
        teal: [
          null,
          '#e6fffa',
          '#b2f5ea',
          '#81e6d9',
          '#4fd1c5',
          '#38b2ac',
          '#319795',
          '#2c7a7b',
          '#285e61',
          '#234e52',
        ],
      },
    })
  })
  test('should convert binaryStrColors to object with only colors', () => {
    expect(
      parseConfig(binaryStrColors, {
        colors: true,
        typography: false,
        shadows: false,
      })
    ).toStrictEqual({
      colors: {
        text: '#000',
        cool: {
          one: '#f4f4f4',
          two: '#f3f3f3',
        },
        teal: [
          null,
          '#e6fffa',
          '#b2f5ea',
          '#81e6d9',
          '#4fd1c5',
          '#38b2ac',
          '#319795',
          '#2c7a7b',
          '#285e61',
          '#234e52',
        ],
      },
    })
  })
  test('should convert binaryStrTypo to object with only typography', () => {
    expect(
      parseConfig(binaryStrTypo, {
        colors: false,
        typography: true,
        shadows: false,
      })
    ).toStrictEqual({
      fonts: {
        body: '-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial',
        heading: 'inherit',
        monospace: 'Menlo,monospace',
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
})
