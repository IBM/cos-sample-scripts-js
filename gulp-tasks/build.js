const gulp = require('gulp');
const del = require('del');
const { rollup } = require('rollup');

const gulpConfig = require('./config');
const rollupBuild = require('../rollup');
const scriptsConfig = require('../scripts.json');

gulp.task('clean:dist', () => del([`${gulpConfig.destDir}`]));

const buildScript = async (script) => {
  const rollupConfig = rollupBuild(script);
  const bundle = await rollup(rollupConfig);
  console.info(`Generating file: ${script.name}.js`);
  await bundle.write(rollupConfig.output);
};

gulp.task('build:scripts', () => {
  const { cloptions: { all, name } } = gulpConfig;
  const { scripts } = scriptsConfig;
  const buildJobs = [];
  scripts.forEach((script) => {
    if (all || script.name === name) {
      buildJobs.push(buildScript(script));
    }
  });
  console.info('Building scripts - started');
  return Promise.all(buildJobs);
});

gulp.task('build', gulp.series('clean:dist', gulp.parallel('build:scripts')));
