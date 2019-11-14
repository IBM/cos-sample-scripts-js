const parseArgs = require('minimist');

const config = {
  env: 'dev',
  nodeModulesDir: 'node_modules',
  sourceDir: 'src',
  destDir: 'scripts',
  gulpDir: 'gulp-tasks',
  cloptions: parseArgs(process.argv.slice(2), ({
    alias: {
      a: 'all',
      n: 'name',
    },
    boolean: [
      'all',
      'name',
    ],
  })),
};
module.exports = config;
