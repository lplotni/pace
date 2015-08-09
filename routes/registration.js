var express = require('express');
var router = express.Router();
var _ = require('lodash');

var pg = require('pg');
var client = new pg.Client("tcp://vagrant@localhost/vagrant");

/* GET registrationRoute listing. */
router.get('/', function(req, res) {
  res.render('registration/registration', {});
});

router.post('/', function(req, res) {
    try{
        var participant = extractParticipant(req);
        //store in DB
        client.connect(function(){
            client.query(
                "insert into participants (first_name, last_name, email) values($1, $2, $3)",[participant.firstName, participant.lastName, participant.email],
                function (err, res) {
                    console.log('Executed');
                    if (! err) {
                        console.log("result:" , res);
                        client.end();
                        return "inserted";
                    }
                }
            )
        });

        res.render('registration/success', {name: participant.firstName +' '+ participant.lastName, link: ''});
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
