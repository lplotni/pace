/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

const helper = require('./journeyHelper');

describe('regisitration journey', () => {

  let client;
  beforeEach(() => {
    helper.changeOriginalTimeout();
    client = helper.setUpClient();
  });

  afterEach(() => {
    helper.resetToOriginalTimeout();
  });

  it('allows to register via the registration page', (done) => {
    client.url(helper.paceUrl)
      .click('a#registration')
      .isVisible('form#registrationForm')
      .setValue('input#firstname', 'Max')
      .setValue('input#lastname', 'Mustermann')
      .setValue('input#email', 'max@example.com')
      .selectByValue('select#category', 'f')
      .setValue('input#birthyear', 2000)
      .setValue('input#team', 'Crazy runners')
      .selectByIndex('select#visibility', 1)
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
      .url(helper.paceUrl + 'paymentvalidation')
      .getText('ul#pending')
      .then(function (text) {
        expect(text).toMatch(/.*Max Mustermann*/);
      })
      .end(done);
  });

});