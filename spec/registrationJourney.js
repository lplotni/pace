/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

const helper = require('./journeyHelper');
const config = require('config');

describe('registration journey', () => {

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
      .then((isVisible) => {
        expect(isVisible).toBe(true);
      })
      .isVisible('a#editurl')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .getText('span.amount')
      .then((amount) => {
        expect(amount).toMatch(/20.00/);
      })
      .getText('span.startNumber')
      .then((number) => {
        expect(number).toMatch(/d*/);
      })
      .end(done);
  });

});
