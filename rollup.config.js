import svelte from "rollup-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import replace from "@rollup/plugin-replace"
import { terser } from "rollup-plugin-terser"
import svg from "rollup-plugin-svg"
import typescript from "@rollup/plugin-typescript"
import postcss from "rollup-plugin-postcss"
import cssnano from "cssnano"
import htmlBundle from "rollup-plugin-html-bundle"

const production = !process.env.ROLLUP_WATCH

/**
 * @type {import('rollup').RollupOptions}
 */
const mainConfig = {
  input: `src/main.ts`,
  output: {
    format: `iife`,
    name: `ui`,
    file: `dist/bundle.js`,
  },
  plugins: [
    typescript(),
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),
    resolve({
      browser: true,
      dedupe: (importee) => importee === `svelte` || importee.startsWith(`svelte/`),
    }),
    commonjs(),
    svg(),
    postcss({
      extensions: [`.css`],
      plugins: [cssnano()],
    }),
    htmlBundle({
      template: `src/template.html`,
      target: `dist/ui.html`,
      inline: true,
    }),
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
}

/**
 * @type {import('rollup').RollupOptions}
 */
const codeConfig = {
  input: `src/code.ts`,
  output: {
    file: `dist/code.js`,
    format: `cjs`,
    name: `code`,
  },
  plugins: [
    typescript(),
    replace({
      values: {
        "process.env.NODE_ENV": JSON.stringify(production ? `production` : `development`),
      },
      preventAssignment: true,
    }),
    commonjs(),
    resolve({
      browser: true,
    }),
    production && terser(),
  ],
}

const config = [mainConfig, codeConfig]

export default config
