const ts = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const functional = require('eslint-plugin-functional')
const imprt = require('eslint-plugin-import')

module.exports = [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: [
      'src/utils/charting_library/*',
      'src/utils/datafeeds/*',
      'src/utils/health_computer/*',
      'src/types/generated/**/*',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: 'latest',
        project: './tsconfig.json',
      },
    },
    plugins: {
      functional,
      import: imprt,
      '@typescript-eslint': ts,
      ts,
    },
    rules: {
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'require-jsdoc': 'off',
      'linebreak-style': ['warn', 'unix'],
      'sort-imports': [
        'warn',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],
    },
  },
]
