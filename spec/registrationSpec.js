describe('registration on post',  function(){


    it('should read firstName from the request body', function() {
        var parseFunction = require('../routes/registration.js').parseFunction;

        var returnedName = parseFunction({body:
        {
            firstName: 'Mark'
        }
        });

        expect(returnedName).toBe('Mark');

    });

    it('should read Peter as firstName from the request body', function() {
        var parseFunction = require('../routes/registration.js').parseFunction;

        var returnedName = parseFunction({body:
        {
            firstName: 'Peter'
        }
        });

        expect(returnedName).toBe('Peter');

    });

    it('should throw an error if no firstName can be found', function() {
        var parseFunction = require('../routes/registration.js').parseFunction;

        function callWithNoFirstname() {
            parseFunction({body:{}});
        }

        expect(callWithNoFirstname).toThrow();
    });



});