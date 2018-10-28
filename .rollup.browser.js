import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'index.js',
	output: [
		{ file: 'browser.js', format: 'iife', name: 'jshape' }
	],
	plugins: [
		babel({
			presets: [
				['@babel/env', { modules: false, targets: 'ie >= 9' }]
			]
		}),
		terser({ mangle: { properties: { reserved: ['asArray', 'asBoolean', 'asHashmap', 'asNumber', 'asOptional', 'asShape', 'asString'] } } })
	]
};
