/* jshint node: true */
/* jshint esnext: true */
'use strict';

const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const jshint = require('gulp-jshint');
const shell = require('gulp-shell');
const argv = require('yargs').argv;

gulp.task('test', function () {
  if (argv.single) {
    return gulp.src([argv.single]).pipe(jasmine({verbose: true}));
  } else {
    return gulp.src(['spec/**/*.js', '!spec/**/*IT*.js', '!spec/**/*Journey.js']).pipe(jasmine({verbose: true}));
  }
});

gulp.task('test-integration', function () {
  if (argv.single) {
    return gulp.src([argv.single]).pipe(jasmine({verbose: true}));
  } else {
    return gulp.src('spec/**/*IT*.js').pipe(jasmine({verbose: true}));
  }
});


gulp.task('lint', () => {
  return gulp.src(['app.js', './spec/**/*.js', './service/**/*.js', './routes/**/*.js', './domain/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(require("jshint-stylish")))
    .pipe(jshint.reporter('fail'));
});

gulp.task('default', shell.task(['node app.js']));
