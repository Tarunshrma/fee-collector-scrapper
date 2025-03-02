import eslint   from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
   eslint.configs.recommended,
   ...tseslint.configs.strict,
   { ignores: ['**/*.js','dist/','node_modules/'] },
   {
      rules: {
         '@typescript-eslint/no-non-null-assertion': 'off',
      },
   },
];