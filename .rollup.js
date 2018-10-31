import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';

const isBrowser = String(process.env.NODE_ENV).includes('browser');
const isBrowserMin = String(process.env.NODE_ENV).includes('browser:min');

// support IE9+ browsers, otherwise node 6+
const targets = isBrowser ? 'ie >= 9' : { node: 6 };

// write to jshape.js/jshape.min.js for browsers, index.cjs.js/index.esm.mjs for node
const output = isBrowser
	? { file: `jshape${isBrowserMin ? '.min' : ''}.js`, format: 'iife', name: 'jshape', sourcemap: !isBrowserMin }
: [
	{ file: 'index.js', format: 'cjs', sourcemap: true },
	{ file: 'index.mjs', format: 'es', sourcemap: true }
];

// use babel, and also terser to minify jshape.min.js
const plugins = [
	babel({
		presets: [
			['@babel/env', { targets }]
		]
	})
].concat(
	isBrowserMin
		? terser({
			mangle: {
				properties: {
					reserved: ['asArray', 'asBoolean', 'asHashmap', 'asNumber', 'asOptional', 'asShape', 'asString', 'value']
				}
			}
		})
	: []
);

export default { input: 'src/index.js', output, plugins };
