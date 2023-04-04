import { defineConfig } from 'rollup';
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

module.exports = defineConfig({
  input: './src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'commonjs'
  },
  plugins: [
    typescript({
      allowImportingTsExtensions: true
    }),
    nodeResolve(),
    commonjs(),
    json()
  ]
})