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

  function cleanUp(selenium, done) {
    gutil.log('Clean-up: ', gutil.colors.magenta('selenium'));
    selenium.kill();
    done();
  }

  startSelenium().then((selenium) => {
    testFunctional(argv.single).then(() => {
      cleanUp(selenium, deferred.resolve);
    }).fail((e) => {
      gutil.log(e);
      cleanUp(selenium, deferred.reject);
    });
  });
});

gulp.task('create-pace-db', createdb);

gulp.task('lint', () => {
  return gulp.src(['app.js', './spec/**/*.js', './service/**/*.js', './routes/**/*.js', './domain/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(require("jshint-stylish")))
    .pipe(jshint.reporter('fail'));
});

gulp.task('npm-start', shell.task(["npm start"]));
gulp.task('default', ['npm-start']);

gulp.task('start-db', shell.task(["docker run -p 5432:5432 -d --name 'pace-postgres' -e POSTGRES_PASSWORD='pgtester' -e POSTGRES_DB='pace' -e POSTGRES_USER='pgtester' postgres"]));
