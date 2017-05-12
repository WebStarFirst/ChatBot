'use strict';

module.exports = {
	'extends': [
		'defaults/rules/eslint/best-practices/airbnb',
		'defaults/rules/eslint/errors/airbnb',
		'defaults/rules/eslint/node/airbnb',
		'defaults/rules/eslint/strict/airbnb',
		'defaults/rules/eslint/style/airbnb',
		'defaults/rules/eslint/variables/airbnb',
		'defaults/rules/eslint/es6/airbnb',
	],
	'env': {
		'node': true,
		'es6': true,
	},
	'globals': {
		'module': true,
		'__dirname': true,
	},
	'rules': {
		indent: [2, 'tab', {'SwitchCase': 1}],
		'prefer-const': 0,
		'padded-blocks': 0,
		'spaced-comment': 0,
		'default-case': 0,
		'new-cap': 0,
		'semi': 0,
		'no-empty-label': 0,
		'quotes': 0,
		'no-undef': 2,
		'strict':  [0, 'global'],
		'object-curly-spacing': 0,
		'space-before-function-paren': 0,
		'no-trailing-spaces': 0,
		'no-console': 0,
		'no-param-reassign': 0,
		'space-after-keywords': 0,
		'space-return-throw-case': 0,
		'radix': 0,
		'arrow-body-style': 0,
		'no-shadow': 0,
	},
};
