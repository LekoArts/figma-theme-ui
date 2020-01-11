import { convertLineHeight } from '../typography'

describe('convertLineHeight', () => {
  test('should process number values', () => {
    expect(convertLineHeight(1.5)).toStrictEqual({
      value: 150,
      unit: 'PERCENT',
    })
  })
})
