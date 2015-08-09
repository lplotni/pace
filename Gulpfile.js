var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');

gulp.task('lint', function() {
  return gulp.src(['app.js','./routes/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});

gulp.task('express', function() {
  var debug = require('debug')('generated');
  var app = require('./app.js');

  app.set('port', process.env.PORT || 3000);

  var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
  });
});

gulp.task('test', function(){
  return gulp.src('spec/*.js').pipe(jasmine());
});

gulp.task('create-db', shell.task(['node models/database.js']));

gulp.task('default', ['express'], function() {
});
