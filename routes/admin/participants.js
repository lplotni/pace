/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const router = require('express').Router();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const participants = require('../../service/participants');
const participant = require('../../domain/participant');
const editUrlHelper = require('../../domain/editUrlHelper');
const costCalculator = require('../../domain/costCalculator');


//TODO Move those 2 method out of the Ctrl.
let addEditUrlTo = function (participants) {
  participants.map(participant => {
    participant.editUrl = editUrlHelper.generateUrlForAdmin(participant.secureid);
    return participant;
  });
};

let addAmountTo = function (participants) {
  participants.map(function(participant) {
    participant.amount = costCalculator.priceFor(participant);
    return participant;
  });
};


router.get('/', isAuthenticated, (req, res) => {
  participants.getConfirmed().then(result => {
    var allParticipants = result;
    participants.getRegistered().then(result => {
      allParticipants = allParticipants.concat(result);
      addEditUrlTo(allParticipants);
      Q.all(allParticipants.map(participant.addTshirtDetailsTo))
        .then(() => {
            addAmountTo(allParticipants);
            res.render('admin/list', {participants: allParticipants, isAdmin: true});
          }
        );
    });
  });

});

module.exports = router;
