module.exports = {
	root: true,
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: {
		browser: true,
		commonjs: true,
		es6: true,
	},

	// Base config
	extends: ['eslint:recommended'],

	rules: {
		camelcase: ['error', { properties: 'always' }],
		eqeqeq: ['error', 'always'],
		'no-magic-numbers': 'error',
		'no-multi-assign': 'error',
	},
}
