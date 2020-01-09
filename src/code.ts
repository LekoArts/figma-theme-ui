import { addColors, convertColor } from './core/colors'
import { flattenObject } from './core/utils'
import { parseConfig } from './core/config'

figma.showUI(__html__, { width: 280, height: 280 })

figma.ui.onmessage = (msg: IMessage) => {
  const { type, payload } = msg

  const config = parseConfig(payload.config)
  const flatColors = flattenObject(config.colors)
  const colors = Object.keys(flatColors).map(key => ({
    name: key,
    value: convertColor(flatColors[key]),
  }))

  if (type === 'CREATE_STYLES') {
    addColors(colors)
  }

  figma.closePlugin()
}
