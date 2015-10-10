/* jshint node: true */
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');

var pg = require('pg');
var connectionString = process.env.DATABASE_URL || "tcp://vagrant@localhost/pace";

var participants = require('../service/participants');
/* GET registrationRoute listing. */
router.get('/', function(req, res) {
    res.render('registration/registration', {});
});

router.post('/', function(req, res) {
    try{
        var participant = extractParticipant(req);
        participants.save(participant, createUniqueToken());

        res.render('registration/success', {name: participant.firstname +' '+ participant.lastname, link: ''});
    } catch (err) {
        res.send(err.message);
    }
});

function invalidData(body) {
    return _.isUndefined(body.firstname) || _.isUndefined(body.lastname) || _.isUndefined(body.email);
}
var extractParticipant = function (req) {

    var body = req.body;
    if(invalidData(body)){
        throw new TypeError("Required attributes are not present");
    }

    return {
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        gender: body.gender
    };
};

var createUniqueToken = function() {
    return Math.random().toString(32).substring(2);
};

module.exports = {
    router: router,
    extractParticipant: extractParticipant
};
