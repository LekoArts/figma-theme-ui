import { flattenObject } from '../utils'

const normal = {
  foo: 'bar',
  harry: 'potter',
}

const oneLevel = {
  foo: 'bar',
  gryffindor: {
    harry: 'potter',
    hermione: 'granger',
  },
}

const twoLevel = {
  foo: 'bar',
  hogwarts: {
    gryffindor: {
      harry: 'potter',
    },
    slytherin: {
      draco: 'malfoy',
    },
  },
}

describe('flattenObject', () => {
  test('should keep flat object intact', () => {
    expect(flattenObject(normal)).toStrictEqual({
      foo: 'bar',
      harry: 'potter',
    })
  })
  test('should flatten one level', () => {
    expect(flattenObject(oneLevel)).toStrictEqual({
      foo: 'bar',
      'gryffindor.harry': 'potter',
      'gryffindor.hermione': 'granger',
    })
  })
  test('should flatten more than one level', () => {
    expect(flattenObject(twoLevel)).toStrictEqual({
      foo: 'bar',
      'hogwarts.gryffindor.harry': 'potter',
      'hogwarts.slytherin.draco': 'malfoy',
    })
  })
})
