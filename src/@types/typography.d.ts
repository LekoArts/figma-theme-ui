import * as CSS from "csstype"
import type { ObjectOrArray } from "styled-system"
import type { Theme } from "theme-ui"

type StandardFonts = ObjectOrArray<CSS.FontFamilyProperty>

interface IConvertFonts extends Theme {
  fonts?: StandardFonts & {
    body?: string
    heading?: string
  }
}
