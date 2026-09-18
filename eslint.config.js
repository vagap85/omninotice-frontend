import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import importX from 'eslint-plugin-import-x'

const skipImportChecks = process.env.NO_IMPORTS === 'true'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import-x': importX,
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      'import-x/no-unresolved': skipImportChecks ? 'off' : 'error',
      'import-x/no-cycle': skipImportChecks ? 'off' : 'warn',
      'import-x/no-duplicates': skipImportChecks ? 'off' : 'error',
      'import-x/no-self-import': skipImportChecks ? 'off' : 'error',
      'import-x/no-useless-path-segments': skipImportChecks ? 'off' : 'warn',
      'import-x/newline-after-import': skipImportChecks ? 'off' : 'warn',
      'import-x/order': skipImportChecks
        ? 'off'
        : [
            'warn',
            {
              groups: [
                'builtin',
                'external',
                'internal',
                'parent',
                'sibling',
                'index',
              ],
              'newlines-between': 'always',
              alphabetize: { order: 'asc', caseInsensitive: true },
            },
          ],
    },
  },
)