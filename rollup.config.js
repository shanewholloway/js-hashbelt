import { terser as rpi_terser } from 'rollup-plugin-terser' // if you want minification

const _cfg_ = { plugins: [] }

// Allow Minification -- https://github.com/TrySound/rollup-plugin-terser
let is_watch = process.argv.includes('--watch')
const _cfg_min_ = is_watch || 'undefined'===typeof rpi_terser ? null
  : { ... _cfg_, plugins: [ ... _cfg_.plugins, rpi_terser() ]}

export default [
	{ ..._cfg_, input: 'code/hashbelt.js', output: [
      { file: 'esm/hashbelt.js', format: 'es'},
      { file: 'cjs/hashbelt.cjs', format: 'cjs', exports: 'named' },
      { file: 'umd/hashbelt.js', format: 'umd', exports: 'named', name: 'hashbelt' },
  ]},

	_cfg_min_ && { ..._cfg_min_, input: 'code/hashbelt.js', output: [
      { file: 'esm/hashbelt.min.js', format: 'es'},
      { file: 'umd/hashbelt.min.js', format: 'umd', exports: 'named', name: 'hashbelt' },
  ]},

].filter(Boolean)

