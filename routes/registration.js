/* jshint node: true */
'use strict';

var express = require('express');
var router = express.Router();

var participants = require('../service/participants');
var participant = require('../domain/participant');

var createUniqueToken = function() {
    return Math.random().toString(32).substring(2);
};

router.get('/', function(req, res) {
    res.render('registration/registration', {});
});

router.post('/', function(req, res) {
    try{
        var newParticipant = participant.extract(req.body);
        var token = createUniqueToken();
        participants.register(newParticipant, token);
        res.render('registration/success', {name: newParticipant.firstname +' '+ newParticipant.lastname, token: token, link: ''});
    } catch (err) {
        res.send(err.message);
    }
});

module.exports =  router;
