/* jshint node: true */
/* global describe, beforeAll, beforeEach, afterAll, it, expect */
'use strict';

var participants = require('../service/participants');
var pg = require('pg');
var helper = require('./journeyHelper');
var costCalculator = require('../domain/costCalculator');

describe('payment validation journey', function () {
  var loggedInClient;
  var paymentValidationUrl = helper.paceUrl + 'paymentvalidation';
  var loginUrl = helper.paceUrl + 'login';

  beforeAll(function (done) {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterAll(function () {
    helper.resetToOriginalTimeout();
    pg.end();
  });

  describe('when not logged in', function () {

    it('redirects to the login page for unauthenticated users', function (done) {
      helper.setUpClient().url(paymentValidationUrl)
        .isVisible('form#loginForm')
        .then(function (isVisible) {
          expect(isVisible).toBe(true);
        })
        .end(done);
    });
  });

  describe('when logged it', function () {

    beforeEach(function () {
      loggedInClient = helper.setUpClient()
        .url(loginUrl)
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
        email: 'f.schiller@example.com',
        tshirt: {
          size: 'M',
          model: 'Normal fit'
        }
      };
      var aToken = '23eF67i';

      participants.register(aParticipant, aToken)
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
              expect(text).toContain(costCalculator.priceFor(aParticipant));
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
      var aToken = '24eFXXi';

      participants.save(aParticipant, aToken)
        .then(function () {
          loggedInClient.url(paymentValidationUrl)
            .isVisible('ul#pending')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .getText('ul#pending')
            .then(function (text) {
              expect(text).toMatch(/.*Token: 24eFXXi$/);
            })
            .end(done);
        });
    });
  });
});
