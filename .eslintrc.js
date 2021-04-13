module.exports = {
  parser: `@typescript-eslint/parser`, // Specifies the ESLint parser
  extends: [`plugin:@typescript-eslint/recommended`, `plugin:import/typescript`, `plugin:prettier/recommended`],
  plugins: [`@typescript-eslint`, `prettier`],
  parserOptions: {
    ecmaVersion: 2019, // Allows for the parsing of modern ECMAScript features
    sourceType: `module`, // Allows for the use of imports
  },
  env: {
    browser: true,
    jest: true,
    node: true,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      1,
      {
        argsIgnorePattern: `res|next|stage|^err|on|config|e`,
      },
    ],
    "arrow-body-style": [2, `as-needed`],
    "no-param-reassign": [
      2,
      {
        props: false,
      },
    ],
    "no-unused-expressions": [
      1,
      {
        allowTaggedTemplates: true,
      },
    ],
    quotes: `off`,
    "@typescript-eslint/quotes": [
      2,
      `backtick`,
      {
        avoidEscape: true,
      },
    ],
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/interface-name-prefix": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/ban-ts-ignore": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/camelcase": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "no-console": 0,
    "spaced-comment": 0,
    "no-use-before-define": 0,
    "linebreak-style": 0,
    "consistent-return": 0,
    import: 0,
    "func-names": 0,
    "import/no-extraneous-dependencies": 0,
    "import/prefer-default-export": 0,
    "import/no-cycle": 0,
    "space-before-function-paren": 0,
    "import/extensions": 0,
    indent: [`error`, 2, { SwitchCase: 1 }],
    "prettier/prettier": [
      `error`,
      {
        trailingComma: `es5`,
        semi: false,
        singleQuote: false,
        printWidth: 120,
      },
    ],
  },
}
