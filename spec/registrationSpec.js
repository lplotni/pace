describe('registration on post', function () {

    var extractParticipant;
    var validRequestData = {
        body: {
            firstName: 'Mark',
            lastName: 'Mueller',
            email: 'm.mueller@example.com'
        }
    };

    beforeEach(function () {
        extractParticipant = require('../routes/registration.js').extractParticipant;
    });

    it('should read firstName from the request body', function () {
        expect(extractParticipant(validRequestData).firstName).toBe('Mark');
    });

    it('should throw an error if no firstName can be found', function () {
        var extractParticipant = require('../routes/registration.js').extractParticipant;

        function callWithNoFirstname() {
            extractParticipant({body: {}});
        }

        expect(callWithNoFirstname).toThrow();
    });

    it('should throw an error if no lastName can be found', function () {
        var extractParticipant = require('../routes/registration.js').extractParticipant;

        function callWithNoFirstname() {
            extractParticipant({body: {firstName: 'XX'}});
        }

        expect(callWithNoFirstname).toThrow();
    });
    
    it('should throw an error if no email can be found', function () {
        var extractParticipant = require('../routes/registration.js').extractParticipant;

        function callWithNoEmail() {
            extractParticipant({body: {firstName: 'XX', lastName: 'YY'}});
        }

        expect(callWithNoEmail).toThrow();
    });

    it('should read lastName from the request body', function () {
        expect(extractParticipant(validRequestData).lastName).toBe('Mueller');
    });


    it('should read email from the request body', function () {
        expect(extractParticipant(validRequestData).email).toBe('m.mueller@example.com');
    });


});