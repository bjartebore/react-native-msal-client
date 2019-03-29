// flow
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**',
    }),
    commonjs(),
  ],
  external: ['react-native'],
};
