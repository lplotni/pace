/* jshint node: true */
/* global describe, beforeEach, afterEach, afterAll, it, jasmine, expect */
'use strict';

describe('admin page', function() {

    var client;
    var paceUrl = process.env.PACE_URL || 'http://localhost:3000/';
    var loginUrl = paceUrl + 'login';
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

    it('should login as admin and go to admin page', function (done) {
        client.init()
            .url(loginUrl)
            .setValue('input#username', 'admin')
            .setValue('input#password', 'admin')
            .click('button#submit')
            .isVisible('a#paymentValidation')
            .then(function(isVisible) {
                expect(isVisible).toBe(true);
                done();
            })
            .end();
    });

    it('should stay on login page for wrong login credentials and display an error message', function (done) {
        client.init()
            .url(loginUrl)
            .setValue('input#username', 'admin')
            .setValue('input#password', 'wrong password')
            .click('button#submit')
            .isVisible('form#loginForm')
            .then(function(isVisible) {
                expect(isVisible).toBe(true);
            })
            .getText('div.error')
            .then(function (errorMessage) {
                expect(errorMessage).toBe('Bitte Benutzername und Passwort überprüfen.');
                done();
            })
            .end();
    });
});