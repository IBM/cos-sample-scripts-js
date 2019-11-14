const path = require('path');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');

const build = (script) => {
  const { buildInfo: { fileName }, } = script;
  return {
    input: path.resolve(__dirname, './', fileName),
    output: {
      file: path.resolve(__dirname, './scripts', `${script.name}.js`),
      name: `${script.name}.js`,
      format: 'cjs',
      strict: false
    },
    external: ['request', 'request-promise', 'ibm-cos-sdk', 'ibm-cos-sdk-config'],
    plugins: [
      resolve({
        preferBuiltins: true,
      }),
      commonjs(),
      json()
    ]
  };
};

module.exports = build;
