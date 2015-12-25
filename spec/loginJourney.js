/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

let helper = require('./journeyHelper');

describe('admin page', () => {

  let client;
  let loginUrl = helper.paceUrl + 'login';

  beforeEach(() => {
    helper.changeOriginalTimeout();
    client = helper.setUpClient();
  });

  afterEach(() => {
    helper.resetToOriginalTimeout();
  });

  it('should login as admin and go to admin page', (done) => {
    client.url(loginUrl)
      .setValue('input#username', 'admin')
      .setValue('input#password', 'admin')
      .click('button#submit')
      .isVisible('a#paymentValidation')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  it('should stay on login page for wrong login credentials and display an error message', (done) => {
    client.url(loginUrl)
      .setValue('input#username', 'admin')
      .setValue('input#password', 'wrong password')
      .click('button#submit')
      .isVisible('form#loginForm')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .getText('div.error')
      .then(function (errorMessage) {
        expect(errorMessage).toBe('Bitte Benutzername und Passwort überprüfen.');
      })
      .end(done);
  });
});