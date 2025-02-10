import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

const eslintConfig = [...compat.extends(
  'eslint:recommended',
  'plugin:@angular-eslint/recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/strict',
  'plugin:@typescript-eslint/stylistic',
  //'plugin:tailwindcss/recommended',
), {
  rules: {
    indent: ['warn', 2],
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
    'keyword-spacing': ['warn'],
    'object-curly-spacing': ['warn', 'always'],
    'space-before-blocks': ['warn', 'always'],
    'no-unused-vars': 0,
    '@typescript-eslint/no-invalid-void-type': 0,
  },
}]

export default eslintConfig
