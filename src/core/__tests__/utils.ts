import { flattenObject, stringToArray } from "../utils"

const normal = {
  foo: `bar`,
  harry: `potter`,
}

const oneLevel = {
  foo: `bar`,
  gryffindor: {
    harry: `potter`,
    hermione: `granger`,
  },
}

const twoLevel = {
  foo: `bar`,
  hogwarts: {
    gryffindor: {
      harry: `potter`,
    },
    slytherin: {
      draco: `malfoy`,
    },
  },
}

const withNull = {
  indigo: [null, `#ebf4ff`, `#c3dafe`],
}

const str = `-apple-system, "Segoe UI", Roboto`

describe(`flattenObject`, () => {
  test(`should keep flat object intact`, () => {
    expect(flattenObject(normal)).toStrictEqual({
      foo: `bar`,
      harry: `potter`,
    })
  })
  test(`should group things in one level`, () => {
    expect(flattenObject(oneLevel)).toStrictEqual({
      foo: `bar`,
      "gryffindor/harry": `potter`,
      "gryffindor/hermione": `granger`,
    })
  })
  test(`should make groups for more than one level`, () => {
    expect(flattenObject(twoLevel)).toStrictEqual({
      foo: `bar`,
      "hogwarts/gryffindor/harry": `potter`,
      "hogwarts/slytherin/draco": `malfoy`,
    })
  })
  test(`should skip null/undefined`, () => {
    expect(flattenObject(withNull)).toStrictEqual({
      "indigo/1": `#ebf4ff`,
      "indigo/2": `#c3dafe`,
    })
  })
})

describe(`stringToArray`, () => {
  test(`should keep order, handle space before commas and remove quotes`, () => {
    expect(stringToArray(str)).toStrictEqual([`-apple-system`, `Segoe UI`, `Roboto`])
    expect(stringToArray(str)).toHaveLength(3)
  })
})
