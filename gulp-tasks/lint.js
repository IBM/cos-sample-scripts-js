const gulp = require('gulp');
const gulpIf = require('gulp-if');
const eslint = require('gulp-eslint');
const gulpConfig = require('./config');

const isFixed = file => file.eslint != null && file.eslint.fixed;

gulp.task('lint:gulpscripts', () => gulp.src([
  `${gulpConfig.gulpDir}/**/*.js`
])
  .pipe(eslint({ fix: true }))
  .pipe(eslint.format())
  .pipe(gulpIf(isFixed, gulp.dest(`${gulpConfig.gulpDir}`)))
  .pipe(eslint.failAfterError()));

gulp.task('lint:codescripts', () => gulp.src([`${gulpConfig.sourceDir}/**/*.js`])
  .pipe(eslint({ fix: true }))
  .pipe(eslint.format())
  .pipe(gulpIf(isFixed, gulp.dest(gulpConfig.sourceDir)))
  .pipe(eslint.failAfterError()));

gulp.task('lint:scripts', gulp.parallel('lint:gulpscripts', 'lint:codescripts'));

gulp.task('lint', gulp.parallel('lint:scripts'));
