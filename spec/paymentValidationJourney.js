/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeAll, beforeEach, afterAll, it, expect */
'use strict';

const participants = require('../service/participants');
const pg = require('pg');
const helper = require('./journeyHelper');
const costCalculator = require('../domain/costCalculator');
const config = require('config');

describe('payment validation journey', () => {
  let loggedInClient;
  const paymentValidationUrl = helper.paceUrl + 'paymentvalidation';
  const loginUrl = helper.paceUrl + 'login';

  beforeAll((done) => {
    helper.changeOriginalTimeout();
    helper.setupDbConnection(done);
  });

  afterAll(() => {
    helper.resetToOriginalTimeout();
    pg.end();
  });

  describe('when not logged in', () => {

    it('redirects to the login page for unauthenticated users', (done) => {
      helper.setUpClient().url(paymentValidationUrl)
        .isVisible('form#loginForm')
        .then(function (isVisible) {
          expect(isVisible).toBe(true);
        })
        .end(done);
    });
  });

  describe('when logged it', () => {

    beforeEach(() => {
      loggedInClient = helper.setUpClient()
        .url(loginUrl)
        .setValue('input#username', config.get('admin.username'))
        .setValue('input#password', config.get('admin.password'))
        .click('button#submit');
    });

    it('displays an error message for an invalid token', (done) => {
      let invalidToken = 'invalid';
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

    it('allows to confirm a participant once she has payed', (done) => {
      let aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com',
        tshirt: {
          size: 'M',
          model: 'Normal fit',
          amount: 1
        }
      };

      participants.register(aParticipant)
        .then((result) => {
          loggedInClient.url(paymentValidationUrl)
            .setValue('input#payment-token', result.token)
            .click('button#submit-token')
            .isVisible('form#payment-details')
            .then(function (isVisible) {
              expect(isVisible).toBe(true);
            })
            .getText('p#details')
            .then(function (text) {
              expect(text).toContain('Betrag für Token ' + result.token + ':');
              expect(text).toContain(costCalculator.priceFor(aParticipant));
            })
            .click('button#confirm-registration')
            .isVisible('div.error')
            .then(function (isVisible) {
              expect(isVisible).toBe(false);
            })
            .end(done);
        });
    });

    it('should show pending payments', (done) => {
      let aParticipant = {
        firstname: 'Friedrich',
        lastname: 'Schiller',
        email: 'f.schiller@example.com'
      };
      let aToken = '24eFXXi';

      participants.save(aParticipant, aToken)
        .then(() => {
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
