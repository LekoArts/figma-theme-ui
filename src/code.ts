import { addColors } from './core/colors'
import { parseColors } from './core/colors'
import { parseConfig } from './core/config'
import { parseTypography, addTypography } from './core/typography'

figma.showUI(__html__, { width: 300, height: 185 })

figma.ui.onmessage = async (msg: IMessage) => {
  const { type, payload } = msg

  const config = parseConfig(payload.config, payload.options)
  const colors = parseColors(config.colors)
  const modifiedConfig = await parseTypography(config)

  if (type === 'CREATE_STYLES') {
    if (payload.options.colors) {
      addColors(colors)
    }
    if (payload.options.typography) {
      await addTypography(modifiedConfig)
    }
  }

  figma.closePlugin()
}
