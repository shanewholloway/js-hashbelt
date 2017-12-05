import pkg from './package.json'
import {minify} from 'uglify-es'
import rpi_uglify from 'rollup-plugin-uglify'
import rpi_babel from 'rollup-plugin-babel'

const sourcemap = 'inline'
const plugins = [jsy_plugin()]
const ugly = { compress: {warnings: false}, output: {comments: false}, sourceMap: false }
const prod_plugins = plugins.concat([rpi_uglify(ugly, minify)])

export default [
	{ input: 'code/index.jsy',
		output: [
      { file: pkg.main, format: 'cjs', exports: 'named' },
      { file: pkg.module, format: 'es' },
    ],
    sourcemap, external:[], plugins },

	{ input: 'code/index.jsy', name: pkg.name,
		output: [
      { file: pkg.browser, format: 'umd', exports: 'named' },
    ],
    external:[], plugins: prod_plugins },
]


function jsy_plugin() {
  const jsy_preset = [ 'jsy/lean', { no_stage_3: true, modules: false } ]
  return rpi_babel({
    exclude: 'node_modules/**',
    presets: [ jsy_preset ],
    plugins: [],
    babelrc: false }) }

