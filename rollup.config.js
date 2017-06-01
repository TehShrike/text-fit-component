import babel from 'rollup-plugin-babel'
import svelte from 'rollup-plugin-svelte'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

const pkg = require('./package.json')

export default {
	plugins: [
		nodeResolve(),
		commonjs(),
		svelte(),
		babel({
			babelrc: false,
			// exclude: 'node_modules/**',
			presets: [
				[
					'es2015',
					{
						modules: false
					}
				]
			],
			plugins: [
				'external-helpers'
			]
		}),
	],
	targets: [
		{ dest: pkg.main, format: 'cjs' },
		{ dest: pkg.module, format: 'es' }
	]
}
