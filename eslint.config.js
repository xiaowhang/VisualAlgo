import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import autoImportGlobals from './.eslintrc-auto-import.json' with { type: 'json' }

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...autoImportGlobals.globals,
      },
    },
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      'no-console': 'warn',
    },
  },
  globalIgnores([
    '**/node_modules/',
    '**/.vscode/',
    '**/.husky/',
    '**/dist/',
  ]),
])
