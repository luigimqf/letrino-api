import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from "eslint-config-prettier"

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules', 'build'],
    rules: {
      ...prettierConfig.rules,
      "@typescript-eslint/no-unused-vars": "off"
    }
  }
);