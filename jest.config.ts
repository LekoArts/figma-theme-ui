import type { Config } from "jest"

const config: Config = {
  roots: [`<rootDir>/src`],
  testMatch: [`**/__tests__/**/*.+(ts|tsx|js)`, `**/?(*.)+(spec|test).+(ts|tsx|js)`],
  transform: {
    "^.+\\.(ts|tsx)$": `ts-jest`,
  },
  verbose: true,
  globals: {
    figma: true,
  },
}

export default config
