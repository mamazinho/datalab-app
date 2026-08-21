import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import testingLibrary from 'eslint-plugin-testing-library'
import vitest from '@vitest/eslint-plugin'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    extends: [vitest.configs.recommended, testingLibrary.configs['flat/react']],
    rules: {
      // Helpers de teste exportam funções junto de wrappers — o fast refresh não se aplica.
      'react-refresh/only-export-components': 'off',
      // Sem `globals: true` no Vitest, o cleanup do Testing Library não é registrado sozinho.
      'testing-library/no-manual-cleanup': 'off',
    },
  },
])
