/** @type {import('eslint').Linter.Config[]} */
export default {
  root: true,
  extends: [
    'airbnb-base',
    'prettier',
    'prettier/prettier',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: [
    'prettier',
    '@typescript-eslint',
    'jest',
    '@eslint-community/eslint-comments'
  ],
  rules: {
    'import/prefer-default-export': 'off', // enabled in airbnb-base, agreed to remove in 2023-02-20 engineering check-in
    'no-console': 'off',
    'func-style': 'warn',
    'no-iterator': 'warn',
    'no-restricted-syntax': 'warn',
    'no-bitwise': 'off',
    'no-shadow': 'off',
    'prettier/prettier': 'error',
    'arrow-parens': [2, 'as-needed'],
    'import/extensions': ['warn', { ts: 'never', js: 'never' }],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type'
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc'
        },
        pathGroups: [
          {
            pattern: '@simplifidev/**',
            group: 'external',
            position: 'after'
          },
          {
            pattern: '@summer/**',
            group: 'external',
            position: 'after'
          },
          {
            pattern: '@test/**',
            group: 'external',
            position: 'after'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        distinctGroup: true
      }
    ],
    '@typescript-eslint/no-namespace': [
      'error',
      {
        allowDefinitionFiles: true
      }
    ],
    '@typescript-eslint/no-floating-promises': 2,
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': 'allow-with-description',
        'ts-check': false,
        minimumDescriptionLength: 5
      }
    ],
    'no-restricted-imports': [
      'error',
      {
        name: 'joi',
        importNames: ['default'],
        message:
          'import from utils/validation instead to get correct default behavior'
      }
    ],
    'no-use-before-define': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'lines-between-class-members': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true
      }
    ],
    '@eslint-community/eslint-comments/no-restricted-disable': [
      'error',
      'jest/no-focused-tests',
      '@eslint-community/eslint-comments/no-restricted-disable'
    ],
    '@typescript-eslint/consistent-type-imports': 'error'
  },
  overrides: [
    {
      files: ['src/db/{seeders,migrations,config}/*.js'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off', // used for 'down' migration in scripts
        '@typescript-eslint/no-var-requires': 'off' // not valid in scripts
      }
    },
    {
      files: ['src/types/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off'
      }
    }
  ],
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
      typescript: {} // this loads <rootdir>/tsconfig.json to eslint
    }
  },
  env: {
    es6: true,
    node: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true
    },
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname
  }
}
