/* jshint node: true */
'use strict';

var router = require('express').Router();
var participants = require('../service/participants');
var accesscontrol = require('../acl/accesscontrol');
var participantsSorter = require('../domain/participantsSorter');

var canViewParticipantDetails = function(role) {
    return accesscontrol.hasPermissionTo(role, 'view participant details');
};

var useDefaultAuthentication = function(req, res, next){
    if(req.user) {
        return next();
    } else {
        var user = {username: 'guest', role: 'guest'};
        req.logIn(user, next);
    }
};

router.get('/', useDefaultAuthentication, function (req, res) {
    if(canViewParticipantDetails(req.user.role)) {
        participants.getConfirmed().then(function (result) {
            var allParticipants = result;
            participants.getRegistered().then(function (result) {
                allParticipants = allParticipants.concat(result);
                allParticipants = participantsSorter.byLastname(allParticipants);
                return res.render('participants/list', {participants: allParticipants, isAdmin: true});
            });
        });
    } else {
        participants.getConfirmed().then(function (result) {
            return res.render('participants/list', {participants: result, isAdmin: false});
        });
    }
});

router.post('/', function(req, res) {
    var participants = JSON.parse(req.body.participants);
    var sortedParticipants = participantsSorter[req.body.sortFunction](participants);
    return res.render('participants/list', {participants: sortedParticipants, isAdmin: true});
});

module.exports = router;
