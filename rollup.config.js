import svelte from "rollup-plugin-svelte"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import replace from "@rollup/plugin-replace"
import livereload from "rollup-plugin-livereload"
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
    file: `lib/bundle.js`,
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
      dedupe: [`svelte`],
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

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `dist` directory and refresh the
    // browser on changes when not in production
    !production && livereload(`dist`),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
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
        "process.env.NODE_ENV": production ? JSON.stringify(`production`) : JSON.stringify(`development`),
      },
      preventAssignment: true,
    }),
    commonjs(),
    resolve({
      browser: true,
      dedupe: [`svelte`],
    }),
    production && terser(),
  ],
}

const config = [mainConfig, codeConfig]

export default config

function serve() {
  let started = false

  return {
    writeBundle() {
      if (!started) {
        started = true

        require(`child_process`).spawn(`npm`, [`run`, `start`, `--`, `--dev`], {
          stdio: [`ignore`, `inherit`, `inherit`],
          shell: true,
        })
      }
    },
  }
}
