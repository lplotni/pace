var express = require('express');
var router = express.Router();

/* GET registrationRoute listing. */
router.get('/', function(req, res) {
  res.render('registration', {});
});

router.post('/', function(req, res) {
    console.log(req.body);
});

var parseRegistrationForm = function (req) {

    var body = req.body;
    var firstName = body.firstName;

    if(firstName === undefined){
        throw new TypeError("First name not found");
    }

    return firstName;
};

module.exports = {
    router: router,
    parseFunction: parseRegistrationForm
};
