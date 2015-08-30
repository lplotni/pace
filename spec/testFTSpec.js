describe('regisitration journey', function () {
    var client;

    beforeEach(function () {
        var webdriverio = require('webdriverio');
        var options = {
            desiredCapabilities: {
                browserName: 'phantomjs'
            }
        };

        client = webdriverio
            .remote(options);
    });

    it('allows to register via the registration page', function (done) {

        client.init()
            .url('http://localhost:3000/')
            .click('a#registration')
            .isVisible('form#registrationForm')
            .then(function (isVisible) {
                expect(isVisible).toBe(true);
                done();
            })
            .end();
    });

});