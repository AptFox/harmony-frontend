/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'next/core-web-vitals', // Next.js rules
    'plugin:@typescript-eslint/recommended',
    // 'plugin:react-hooks/recommended',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    // 'plugin:unused-imports/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier + config-prettier
  ],
  plugins: [
    '@typescript-eslint',
    // 'react-hooks',
    'testing-library',
    'jest-dom',
    'jsx-a11y',
    'import',
    'unused-imports',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'error', // Treat prettier issues as lint errors
    'unused-imports/no-unused-imports': 'error',
    'react/react-in-jsx-scope': 'off', // Next.js doesn't need it
    // 'unused-imports/no-unused-vars': [
    //   'warn',
    //   {
    //     vars: 'all',
    //     varsIgnorePattern: '^_',
    //     args: 'after-used',
    //     argsIgnorePattern: '^_',
    //   },
    // ],
  },
};
