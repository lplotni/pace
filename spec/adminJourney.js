/* jshint node: true */
/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var helper = require('./journeyHelper');

describe('admin page', function () {

  var client;
  var loginUrl = helper.paceUrl + 'login';

  beforeEach(function () {
    client = helper.setUpClient();
    helper.changeOriginalTimeout();
  });

  afterEach(function () {
    helper.resetToOriginalTimeout();
  });

  it('should go to admin page and show admin links', function (done) {
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

  it('should redirect to login page if the user is not logged in', function (done) {
    client.url(helper.paceUrl)
      .click('a#adminPage')
      .isVisible('form#loginForm')
      .then(function (isVisible) {
        expect(isVisible).toBe(true);
      })
      .end(done);
  });
});