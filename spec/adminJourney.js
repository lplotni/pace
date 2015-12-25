/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

let helper = require('./journeyHelper');

describe('admin page', () => {

  let client;
  let loginUrl = helper.paceUrl + 'login';

  beforeEach(() => {
    client = helper.setUpClient();
    helper.changeOriginalTimeout();
  });

  afterEach(() => {
    helper.resetToOriginalTimeout();
  });

  it('should go to admin page and show admin links', (done) => {
    client.url(loginUrl)
      .setValue('input#username', 'admin')
      .setValue('input#password', 'admin')
      .click('button#submit')
      .url(helper.paceUrl)
      .click('a#adminPage')
      .isVisible('a#paymentValidation')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  it('should redirect to login page if the user is not logged in', (done) => {
    client.url(helper.paceUrl)
      .click('a#adminPage')
      .isVisible('form#loginForm')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });
});