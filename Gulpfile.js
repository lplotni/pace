/* jshint node: true */
/* jshint esnext: true */
'use strict';


const gulp = require('gulp');
const jasmine = require('gulp-jasmine');
const jshint = require('gulp-jshint');
const shell = require('gulp-shell');
const selenium = require('selenium-standalone');
const gutil = require('gulp-util');
const argv = require('yargs').argv;
const Q = require('q');


function express() {
  let deferred = Q.defer();
  let app = require('./app.js');
  app.set('port', process.env.PORT || 3000);

  let server = app.listen(app.get('port'), () => {
    gutil.log('Express server listening on port ' + server.address().port);
    deferred.resolve(server);
  });

  return deferred.promise;
}

function vagrant() {
  let deferred = Q.defer();
  let task = shell.task('cd postgres; vagrant up')();
  task.on('end', deferred.resolve);
  task.on('error', deferred.reject);

  return deferred.promise;
}

function createdb() {
  if (argv.ci) {
    gutil.log('Adding -e ci');
    return shell.task('./node_modules/db-migrate/bin/db-migrate -e ci up')();
  } else {
    return shell.task('./node_modules/db-migrate/bin/db-migrate up')();
  }
}

function testFunctional(pathToTest) {
  let src = pathToTest || 'spec/**/*Journey.js';
  let deferred = Q.defer();
  let stream = gulp.src(src).pipe(jasmine({verbose: true}));

  stream.on('data', () => {});

  stream.on('error', deferred.reject);
  stream.on('end', deferred.resolve);
  return deferred.promise;
}

function startSelenium() {
  let deferred = Q.defer();
  selenium.start((err, child) => {
    if (err) {
      gutil.log(err);
      deferred.reject(err);
    } else {
      selenium.child = child;
      deferred.resolve(selenium.child);
    }
  });

  return deferred.promise;
}

gulp.task('express', express);

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

gulp.task('selenium-install', function (done) {
  selenium.install({}, (err) => {
    if (err) {
      gutil.log(err);
    }
    done();
  });
});

gulp.task('test-functional', function () {
  let deferred = Q.defer();

  deferred.promise.then(() => {
    process.exit(0);
  }).fail(() => {
    process.exit(1);
  });

  function cleanUp(selenium, server, done) {
    gutil.log('Clean-up: ', gutil.colors.magenta('selenium'), gutil.colors.magenta('express'));
    selenium.kill();
    server.close(done);
  }

  express().then((server) => {
    startSelenium().then((selenium) => {
      testFunctional(argv.single).then(() => {
        cleanUp(selenium, server, deferred.resolve);
      }).fail((e) => {
        gutil.log(e);
        cleanUp(selenium, server, deferred.reject);
      });
    });
  });
});

gulp.task('create-db', createdb);

gulp.task('lint', () => {
  return gulp.src(['app.js', './spec/**/*.js', './service/**/*.js', './routes/**/*.js', './domain/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(require("jshint-stylish")))
    .pipe(jshint.reporter('fail'));
});

gulp.task('default', ['express']);

gulp.task('database', () => {
  let deferred = Q.defer();
  vagrant().then(() => {
    let task = createdb();
    task.on('end', deferred.resolve);
    task.on('error', deferred.reject);
  }).fail(deferred.reject);

  return deferred.promise;
});

gulp.task('dev-setup', ['database', 'selenium-install']);
