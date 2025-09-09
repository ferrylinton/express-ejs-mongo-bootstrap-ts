// @ts-check

import globals from 'globals';
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
	},
	{
		ignores: ['dist', 'jest.config.js', 'webpack.config.server.js'],
	},
	{
		languageOptions: { globals: globals.node },
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrors: 'none',
				},
			],

			'no-import-assign': 'error',
			'no-unreachable': 'error',
		},
	},
]);
