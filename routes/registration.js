var express = require('express');
var router = express.Router();
var _ = require('lodash');

/* GET registrationRoute listing. */
router.get('/', function(req, res) {
  res.render('registration', {});
});

router.post('/', function(req, res) {
    try{
        extractParticipant(req);
        //store in DB
    } catch (err) {
        res.send(err.message);
    }
});

function invalidData(body) {
    return _.isUndefined(body.firstName) || _.isUndefined(body.lastName) || _.isUndefined(body.email);
}
var extractParticipant = function (req) {

    var body = req.body;
    if(invalidData(body)){
        throw new TypeError("Required attributes are not present");
    }

    return {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email
    };
};

module.exports = {
    router: router,
    extractParticipant: extractParticipant
};
