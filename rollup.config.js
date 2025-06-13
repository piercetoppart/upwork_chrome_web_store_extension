import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const banner = `/*!
 * UpworkIQ Chrome Extension v1.0.0
 * (c) ${new Date().getFullYear()} Pierce Toppart
 * Released under the MIT License.
 */`;

const bookmarkletWrapper = {
  intro: 'javascript:(function(){',
  outro: '})()'
};

export default [
  // Bookmarklet build (minified)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/bookmarklet.min.js',
      format: 'iife',
      name: 'UpworkIQ',
      banner,
      ...bookmarkletWrapper
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          properties: {
            regex: /^_/
          }
        },
        format: {
          comments: false
        }
      })
    ]
  },
  // Development build (non-minified)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/bookmarklet.js',
      format: 'iife',
      name: 'UpworkIQ',
      banner,
      sourcemap: true,
      ...bookmarkletWrapper
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/types'
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs()
    ]
  },
  // Chrome Extension build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/extension/content.js',
      format: 'iife',
      name: 'UpworkIQ',
      banner
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      resolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      terser()
    ]
  }
];