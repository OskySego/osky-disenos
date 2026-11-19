
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^React$' },
      ],
    },
  },
  {
    files: [
      'src/components/FormularioProducto.jsx',
      'src/components/ItemListContainer.jsx',
      'src/pages/GestionCuponesPage.jsx',
      'src/pages/GestionPage.jsx',
      'src/pages/ItemDetail.jsx',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: [
      'src/context/AuthContext.jsx',
      'src/context/CartContext.jsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'warn',
    },
  },
])
