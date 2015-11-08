/* jshint node: true */
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');

var participants = require('../service/participants');

function invalidData(body) {
    return _.isUndefined(body.firstname) || _.isUndefined(body.lastname) || _.isUndefined(body.gender) || _.isUndefined(body.birthyear);
}

var extractParticipant = function (req) {
    var body = req.body;

    if(invalidData(body)){
        throw new TypeError('Required attributes are not present');
    }
    return {
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        gender: body.gender,
        birthyear: body.birthyear,
        team: body.team
    };

};

var createUniqueToken = function() {
    return Math.random().toString(32).substring(2);
};

router.get('/', function(req, res) {
    res.render('registration/registration', {});
});

router.post('/', function(req, res) {
    try{
        var participant = extractParticipant(req);
        var token = createUniqueToken();
        participants.register(participant, token);
        res.render('registration/success', {name: participant.firstname +' '+ participant.lastname, token: token, link: ''});
    } catch (err) {
        res.send(err.message);
    }
});

module.exports = {
    router: router,
    extractParticipant: extractParticipant
};
