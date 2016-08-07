/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');
const race = require('../../service/race');
const participant = require('../../domain/participant');
const editUrlHelper = require('../../domain/editUrlHelper');
const isAdmin = require('../../acl/authentication');

router.get('/:secureId', isAdmin, (req, res) => {
  const participantId = req.params.secureId;
  race.startTimesAsHHMM().then(startTimes => {
    participants.bySecureId(participantId)
      .then(p => res.render('admin/participants/editParticipant', {participant: p, participantid: participantId, times: startTimes}))
      .catch(() =>
        res.render('error', {
          message: "Teilnehmer nicht bekannt",
          error: {status: "Möglicherweise wurde ein falscher Link verwendet"}
        })
      );
  });
});

router.post('/', isAdmin, (req, res) => {
  participants.update(participant.from(req.body), req.body.participantid)
    .then(() => res.render('participants/success', {name: req.body.firstname + ' ' + req.body.lastname}))
    .catch(() => res.render('error', {
      message: "Es ist ein Fehler aufgetreten",
      error: {status: "Bitte versuche es nochmal"}
    }));
});

router.post('/delete', isAdmin, (req, res) => {
    participants.delete(req.body.participantid)
      .then(() => res.redirect('/admin/participants'))
      .catch(() => res.render('error', {
        message: "Es ist ein Fehler aufgetreten",
        error: {status: "Bitte versuche es nochmal"}
      }));

});

module.exports = router;
