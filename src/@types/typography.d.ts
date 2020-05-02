import * as CSS from "csstype"
import { ObjectOrArray } from "styled-system"
import { Theme } from "theme-ui"

type StandardFonts = ObjectOrArray<CSS.FontFamilyProperty>

interface IConvertFonts extends Theme {
  fonts?: StandardFonts & {
    body?: string
    heading?: string
  }
}
