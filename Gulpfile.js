var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var shell = require('gulp-shell');
var selenium = require('selenium-standalone');
var gutil= require('gulp-util');
var Q= require('q');


function express() {
    var deferred = Q.defer();
    var app = require('./app.js');
    app.set('port', process.env.PORT || 3000);

    var server = app.listen(app.get('port'), function() {
        gutil.log('Express server listening on port ' + server.address().port);
        deferred.resolve(server);
    });

    return deferred.promise;

}

function vagrant() {
  var deferred = Q.defer();
  var task = shell.task('cd postgres; vagrant up')();
  task.on('end', deferred.resolve);
  task.on('error', deferred.reject);

  return deferred.promise;
}

function createdb() {
  return shell.task('./node_modules/db-migrate/bin/db-migrate up')();
}

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

gulp.task('express', express);

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

gulp.task('test-functional', function () {
    var deferred = Q.defer();

    function cleanUp(selenium, server) {
        gutil.log('Clean-up: ', gutil.colors.magenta('selenium'), gutil.colors.magenta('express'));
        selenium.kill();
        server.close(deferred.resolve);
    }

    express().then(function (server) {
        startSelenium().then(function(selenium) {
            testFunctional().then(function() {
                cleanUp(selenium, server);
            }).fail(function() {
                cleanUp(selenium, server);
            });
        })
    });

    return deferred.promise;
});

gulp.task('create-db', createdb);

gulp.task('lint', function() {
    return gulp.src(['app.js','./spec/**/*.js', './service/*.js','./routes/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default', { verbose: true }));
});

gulp.task('default', ['express']);

gulp.task('database', function () {
  var deferred = Q.defer();
  vagrant().then(function(){
      var task = createdb();
      task.on('end', deferred.resolve);
      task.on('error', deferred.reject);
    }).fail(deferred.reject);

  return deferred.promise;
});

gulp.task('dev-setup', ['database', 'selenium-install']);
