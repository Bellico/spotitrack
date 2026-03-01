import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
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
    // ── Formatage ────────────────────────────────────────────────
    'indent': ['warn', 2],
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'never'],
    'eol-last': ['warn', 'always'],
    'no-trailing-spaces': ['warn'],
    'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0 }],
    'comma-dangle': ['warn', 'always-multiline'],
    'comma-spacing': ['warn', { before: false, after: true }],
    'space-infix-ops': ['warn'],
    'space-before-blocks': ['warn', 'always'],
    'keyword-spacing': ['warn'],
    'key-spacing': ['warn', { beforeColon: false, afterColon: true }],
    'arrow-spacing': ['warn', { before: true, after: true }],
    'object-curly-spacing': ['warn', 'always'],
    'space-in-parens': ['warn', 'never'],
    'array-bracket-spacing': ['warn', 'never'],
    'curly': ['warn', 'all'],
    'brace-style': ['warn', '1tbs', { allowSingleLine: false }],
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['const', 'let'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
      { blankLine: 'always', prev: 'block-like', next: '*' },
    ],

    // ── Qualité ──────────────────────────────────────────────────
    'eqeqeq': ['error', 'always'],
    'no-var': ['error'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-duplicate-imports': ['error'],

    // ── TypeScript ───────────────────────────────────────────────
    'no-unused-vars': 0,
    '@typescript-eslint/no-invalid-void-type': 0,
    '@typescript-eslint/no-inferrable-types': ['warn'],

    // ── Angular ──────────────────────────────────────────────────
    '@angular-eslint/no-empty-lifecycle-method': ['error'],
    '@angular-eslint/use-lifecycle-interface': ['error'],
  },
}]

export default eslintConfig
