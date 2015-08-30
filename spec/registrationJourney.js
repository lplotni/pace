describe('regisitration journey', function () {
    var client;
    var paceUrl = process.env.PACE_URL || 'http://localhost:3000/';
    var originalTimeout;

    beforeEach(function () {
        var webdriverio = require('webdriverio');
        var options = {
            desiredCapabilities: {
                browserName: 'phantomjs'
            }
        };

        client = webdriverio
            .remote(options);
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('allows to register via the registration page', function (done) {

        client.init()
            .url(paceUrl)
            .click('a#registration')
            .isVisible('form#registrationForm')
            .then(function (isVisible) {
                expect(isVisible).toBe(true);
                done();
            })
            .end();
    });

});