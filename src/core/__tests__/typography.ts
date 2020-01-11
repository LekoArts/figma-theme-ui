import { convertLineHeight, convertFontWeight } from '../typography'

describe('convertLineHeight', () => {
  test('should process number values', () => {
    expect(convertLineHeight(1.5)).toStrictEqual({
      value: 150,
      unit: 'PERCENT',
    })
  })
})

describe('convertFontWeight', () => {
  test('should use dictionary to return correct Figma value', () => {
    expect(convertFontWeight(200)).toEqual('Thin')
  })
})
