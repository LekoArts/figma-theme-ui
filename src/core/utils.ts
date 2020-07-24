export const flattenObject = (object: Record<string, unknown>): Record<string, string> => {
  const result = {}
  function flatten(obj, prefix = ``) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key]
      if (!value) return false
      if (typeof value === `object`) {
        flatten(value, `${prefix}${key}/`)
      } else {
        result[`${prefix}${key}`] = value
      }
    })
  }
  flatten(object)
  return result
}

export const stringToArray = (str: string): string[] =>
  str
    .replace(/\s*,\s*/g, `,`)
    .replace(/"/g, ``)
    .split(`,`)
