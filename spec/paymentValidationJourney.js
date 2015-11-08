/* jshint node: true */
/* global describe, beforeAll, beforeEach, afterAll, it, jasmine, expect */
'use strict';

var participants = require('../service/participants');
var webdriverio = require('webdriverio');
var pg = require('pg');

describe('payment validation journey', function () {
  var loggedInClient;
  var paceUrl = process.env.PACE_URL || 'http://localhost:3000/';
  var paymentValidationUrl = paceUrl + 'payment_validation';

  var originalTimeout;
  var options = {
    desiredCapabilities: {
      browserName: 'phantomjs'
    }
  };

  var setupDbConnection = function (done) {
    var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
    var jasmineDone = done;

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


  describe('when not logged in', function () {

    it('redirects to the login page for unauthenticated users', function (done) {
      webdriverio
        .remote(options).init()
        .url(paymentValidationUrl)
        .isVisible('form#loginForm')
        .then(function (isVisible) {
          expect(isVisible).toBe(true);
        })
        .end(done);
    });
  });

  describe('when logged it', function () {
    beforeEach(function (done) {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

      setupDbConnection(done);

      loggedInClient = webdriverio
        .remote(options).init()
        .url(paceUrl + 'login')
        .setValue('input#username', 'admin')
        .setValue('input#password', 'admin')
        .click('button#submit');
    });

    it('displays an error message for an invalid token', function (done) {
      var invalidToken = 'invalid';
      loggedInClient.url(paymentValidationUrl)
        .setValue('input#payment-token', invalidToken)
        .click('button#submit-token')
        .isVisible('form#payment-details')
        .then(function (isVisible) {
          expect(isVisible).toBe(false);
        })
        .getText('div.error')
        .then(function (errorMessage) {
          expect(errorMessage).toBe('Es konnte keine Registrierung mit Token ' + invalidToken + ' gefunden werden.');
        })
        .end(done);
    });

    it('allows to confirm a participant once she has payed', function (done) {
      var aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      var aToken = '23eF67i';

      participants.save(aParticipant, aToken)
        .then(function () {
          loggedInClient.url(paymentValidationUrl)
            .setValue('input#payment-token', aToken)
            .click('button#submit-token')
            .isVisible('form#payment-details')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .getText('p#details')
            .then(function (text) {
              expect(text).toContain('Betrag für Token ' + aToken + ':');
            })
            .click('button#confirm-registration')
            .getText('div.success')
            .then(function (text) {
              expect(text).toBe('Der Teilnehmer wurde bestätigt');
            })
            .end(done);
        });
    });

    it('should show pending payments', function (done) {
      var aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      var aToken = '23eF67i';

      participants.save(aParticipant, aToken)
        .then(function () {
          loggedInClient.url(paymentValidationUrl)
            .isVisible('ul#pending')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .getText('ul#pending')
            .then(function (text) {
              expect(text).toMatch(/.*Token: 23eF67i$/);
            })
            .end(done);
        });
    });
  });
});
