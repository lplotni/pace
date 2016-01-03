/* jshint node: true */
/* jshint esnext: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

let helper = require('./journeyHelper');
let config = require('config');

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
      .setValue('input#username', config.get('admin.username'))
      .setValue('input#password', config.get('admin.password'))
      .click('button#submit')
      .url(helper.paceUrl+'admin')
      .isVisible('a#paymentValidation')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });

  it('should redirect to login page if the user is not logged in', (done) => {
    client.url(helper.paceUrl+'admin')
      .isVisible('form#loginForm')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });
});