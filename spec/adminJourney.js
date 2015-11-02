/* jshint node: true */
/* global describe, beforeEach, afterEach, it, jasmine, expect */
'use strict';

describe('admin page', function() {

    var client;
    var paceUrl = process.env.PACE_URL || 'http://localhost:3000/';
    var originalTimeout;

    beforeEach(function() {
        var webdriverio = require('webdriverio');
        var options = {
            desiredCapabilities: {
                browserName: 'phantomjs'
            }
        };

        client = webdriverio.remote(options);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterEach(function () {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('should go to admin page and show admin links', function (done) {
        client.init()
            .url(paceUrl + 'login')
            .setValue('input#username', 'admin')
            .setValue('input#password', 'admin')
            .click('button#submit')
            .url(paceUrl)
            .click('a#adminPage')
            .isVisible('a#paymentValidation')
            .then(function(isVisible) {
                expect(isVisible).toBe(true);
                done();
            })
            .end();
    });

    it('should redirect to login page if the user is not logged in', function (done) {
        client.init()
            .url(paceUrl)
            .click('a#adminPage')
            .isVisible('form#loginForm')
            .then(function(isVisible) {
                expect(isVisible).toBe(true);
                done();
            })
            .end();
    });
});