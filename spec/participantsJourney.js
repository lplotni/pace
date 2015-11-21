/* jshint node: true */
/* global describe, beforeEach, afterEach, it, jasmine, expect */
'use strict';
var participants = require('../service/participants');
var webdriverio = require('webdriverio');
var pg = require('pg');

describe('participants page', function () {

  var client;
  var paceUrl = process.env.PACE_URL || 'http://localhost:3000/';
  var originalTimeout;

  var options = {
    desiredCapabilities: {
      browserName: 'phantomjs'
    }
  };

  var setupDbConnection = function (done) {
    var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
    var jasmineDone = done;
    client = webdriverio.remote(options);

    pg.connect(connectionString, function (err, client, done) {
          if (err) {
            console.error('DB connection problem: ', err);
            done();
            jasmineDone();
          } else {
            var query = client.query('delete from participants');
            query.on('end', function () {
              done();
              jasmineDone();
            });
            query.on('error', function (error) {
              console.error('DB statement problem: ', error);
              done();
              jasmineDone();
            });
          }
        }
    );
  };

  beforeAll(function (done) {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    setupDbConnection(done);
  });

  afterAll(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    pg.end();
  });

  it('shows full participant list only if logged in as admin', function (done) {
    var aParticipant = {
      firstname: 'Friedrich',
      lastname: 'Schiller',
      email: 'f.schiller@example.com'
    };
    var aToken = 'a token';

    participants.save(aParticipant, aToken)
        .then(function () {
          client.init()
              .url(paceUrl + 'participants')
              .elements('li.participant-line')
              .then(function (res) {
                  expect(res.value.length).toBe(0);
              })
              .url(paceUrl + 'login')
              .setValue('input#username', 'admin')
              .setValue('input#password', 'admin')
              .click('button#submit')
              .url(paceUrl + 'participants')
              .elements('li.participant-line')
              .then(function (res) {
                expect(res.value.length).toBe(1);
              })
              .end(done);
        });
  });
});