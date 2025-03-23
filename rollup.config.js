import rpi_terser from '@rollup/plugin-terser'

export default {
	input: 'code/hashbelt.js',
  output: [
      { file: 'esm/hashbelt.js', format: 'es'},
      { file: 'esm/hashbelt.min.js', format: 'es', plugins: [rpi_terser()]},
      { file: 'cjs/hashbelt.cjs', format: 'cjs', exports: 'named' },
      { file: 'umd/hashbelt.js', format: 'umd', exports: 'named', name: 'hashbelt' },
      { file: 'umd/hashbelt.min.js', format: 'umd', exports: 'named', name: 'hashbelt', plugins: [rpi_terser()] },
]}
