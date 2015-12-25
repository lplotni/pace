/* jshint node: true */
'use strict';

var Q = require('q');
var router = require('express').Router();
var participants = require('../../service/participants');
var accesscontrol = require('../../acl/accesscontrol');
var editUrlGenerator = require('../../domain/editUrlGenerator');
var participant = require('../../domain/participant');

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

var addEditUrlTo = function (participants) {
  participants.map(function(participant) {
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
        addEditUrlTo(allParticipants);
        Q.all(allParticipants.map(participant.addTshirtDetailsTo)).then( function () {
          return res.render('participants/list', {participants: allParticipants, isAdmin: true});
        });
      });
    });
  } else {
    participants.getPubliclyVisible().then(function (result) {
      return res.render('participants/list', {participants: result, isAdmin: false});
    });
  }
});

module.exports = router;
