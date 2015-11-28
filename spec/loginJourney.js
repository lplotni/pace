/* jshint node: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var helper = require('./journeyHelper');

describe('admin page', function () {

  var client;
  var loginUrl = helper.paceUrl + 'login';

  beforeEach(function () {
    helper.changeOriginalTimeout();
    client = helper.setUpClient();
  });

  afterEach(function () {
    helper.resetToOriginalTimeout();
  });

  it('should login as admin and go to admin page', function (done) {
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

  it('should stay on login page for wrong login credentials and display an error message', function (done) {
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