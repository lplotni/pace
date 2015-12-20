/* jshint node: true */
'use strict';

var router = require('express').Router();
var participants = require('../service/participants');
var accesscontrol = require('../acl/accesscontrol');
var editUrlGenerator = require('../domain/editUrlGenerator');

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

var addEditUrlToParticipants = function (participants) {
  return participants.map(function(participant) {
    participant.editUrl = editUrlGenerator.generateEncryptedUrl(participant.id.toString());
    return participant;
  });
};

router.get('/', useDefaultAuthentication, function (req, res) {
  if(canViewParticipantDetails(req.user.role)) {
    participants.getConfirmed().then(function (result) {
      var allParticipants = result;
      participants.getRegistered().then(function (result) {
        allParticipants = allParticipants.concat(result);
        var participantsWithUrl = addEditUrlToParticipants(allParticipants);

        return res.render('participants/list', {participants: participantsWithUrl, isAdmin: true});
      });
    });
  } else {
    participants.getConfirmed().then(function (result) {
      return res.render('participants/list', {participants: result, isAdmin: false});
    });
  }
});

module.exports = router;
