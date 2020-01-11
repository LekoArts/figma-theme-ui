import JSON5 from 'json5/dist/index.min.js'
import { Theme } from 'theme-ui'

export const parseConfig = (config: string): Theme => {
  try {
    // Remove any whitespace
    config = config.replace(/("[^"\\]*(?:\\.[^"\\]*)*")|\s+/gm, '$1')
    // Backticks to double quotes
    config = config.replace(/`/g, '"')
    // Remove anything before module exports
    config = config.replace(/^(.*)(?=module.exports)/gi, '')
    // Remove module.exports=
    config = config.replace('module.exports=', '')
    // Parsed
    const parsed = JSON5.parse(config)

    return JSON.parse(JSON.stringify(parsed))
  } catch (error) {
    throw new Error(error)
  }
}
