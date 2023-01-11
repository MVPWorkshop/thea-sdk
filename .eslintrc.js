module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true,
		jest: true,
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		tsconfigRootDir: __dirname,
		sourceType: "module",
	},
	extends: [
		"plugin:@typescript-eslint/recommended",
		"plugin:prettier/recommended",
		"plugin:prettier/recommended",
		"eslint:recommended",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:security/recommended",
	],
	plugins: ["@typescript-eslint/eslint-plugin", "import"],
	ignorePatterns: [".eslintrc.js"],
	settings: {
		"import/resolver": {
			typescript: {},
		},
	},
	rules: {
		"@typescript-eslint/no-unused-vars": "error",
		"@typescript-eslint/no-explicit-any": "error",
	},
};
