import { parseConfig } from '../config'

const binaryStr = `
module.exports = {
  fonts: {
    body: 'system-ui,sans-serif',
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

describe('parseConfig', () => {
  test('should convert binaryStr to object', () => {
    expect(parseConfig(binaryStr)).toStrictEqual({
      fonts: {
        body: 'system-ui,sans-serif',
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
})
