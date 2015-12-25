/* jshint node: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var helper = require('./journeyHelper');

describe('regisitration journey', function () {

  var client;
  beforeEach(function () {
    helper.changeOriginalTimeout();
    client = helper.setUpClient();
  });

  afterEach(function () {
    helper.resetToOriginalTimeout();
  });

  it('allows to register via the registration page', function (done) {
    client.url(helper.paceUrl)
      .click('a#registration')
      .isVisible('form#registrationForm')
      .setValue('input#firstname', 'Max')
      .setValue('input#lastname', 'Mustermann')
      .setValue('input#email', 'max@example.com')
      .selectByValue('select#category', 'f')
      .setValue('input#birthyear', 2000)
      .setValue('input#team', 'Crazy runners')
      .click('input#visibility')
      .click('input#shirt')
      .selectByIndex('select#model', 1)
      .selectByIndex('select#size', 1)
      .click('button#submit')
      .isVisible('div.thanks')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .getText('span.amount').
      then(function (amount) {
        expect(amount).toBe('35.50');
      })
      .url(helper.paceUrl + 'login')
      .setValue('input#username', 'admin')
      .setValue('input#password', 'admin')
      .click('button#submit')
      .url(helper.paceUrl + 'payment_validation') //todo rename
      .getText('ul#pending')
      .then(function (text) {
        expect(text).toMatch(/.*Max Mustermann*/);
      })
      .end(done);
  });

});