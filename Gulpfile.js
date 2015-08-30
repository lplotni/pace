var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');
var selenium = require('selenium-standalone');
var gutil= require('gulp-util');
var Q= require('q');

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
    gutil.log('Express server listening on port ' + server.address().port);
  });
});

gulp.task('test', function(){
 return gulp.src(['spec/**/*.js', '!spec/**/*IT*.js', '!spec/**/*Journey.js']).pipe(jasmine());
});

gulp.task('test-integration', function (){
 return gulp.src('spec/**/*IT*.js').pipe(jasmine());
});

gulp.task('selenium-install', function (done) {
    selenium.install({
        logger: function (message) {
            gutil.log(message);
        }
    }, function (err) {
        if (err) gutil.log(err);
        done();
    })
});

function testFunctional() {
    var deferred = Q.defer();

    var stream = gulp.src('spec/**/*Journey.js').pipe(jasmine());

    stream.on('data', function () {});
    stream.on('error', deferred.reject);
    stream.on('end', deferred.resolve);

    return deferred.promise;
}

function startSelenium() {
    var deferred = Q.defer();
    selenium.start(function (err, child) {
        if (err) {
            deferred.reject(err);
        }
        selenium.child = child;
        deferred.resolve(selenium.child);
    });

    return deferred.promise;
}

gulp.task('test-functional', function () {
    var deferred = Q.defer();

    startSelenium().then(function(selenium) {
        testFunctional().then(function() {
            gutil.log('Done: Killing', gutil.colors.magenta('selenium'));
            selenium.kill();
            deferred.resolve();
        }).fail(function(err) {
            gutil.log('Error: Killing', gutil.colors.magenta('selenium'));
            selenium.kill();
            deferred.reject(err);
        });
    });

    return deferred.promise;
});

gulp.task('create-db', shell.task(['node models/database.js']));

gulp.task('default', ['express']);
