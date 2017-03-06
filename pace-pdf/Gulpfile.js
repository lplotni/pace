'use strict';
const gulp = require('gulp');
const shell = require('gulp-shell');

gulp.task('default', shell.task(['npm run']));
