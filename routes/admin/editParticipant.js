/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const Q = require('q');
const participants = require('../../service/participants');
const participant = require('../../domain/participant');
const editUrlHelper = require('../../domain/editUrlHelper');

const accesscontrol = require('../../acl/accesscontrol');

var canDeleteUser = function (role) {
  return accesscontrol.hasPermissionTo(role, 'delete');
};

router.get('/', (req, res) => {
  const participantId = editUrlHelper.getIdFromUrl(req.query.edit);
  participants.getFullInfoBySecureId(participantId)
  .then((p) => {
    participant.addTshirtDetailsTo(p)
    .then(() => {
      res.render('admin/editParticipant', {participant: p, participantid: participantId})
    });
  })
    .catch( () =>
      res.render('error', {
        message: "Teilnehmer nicht bekannt",
        error: {status: "Möglicherweise wurde ein falscher Link verwendet"}
      })
    );
});

router.post('/', (req, res) => {
  console.log(JSON.stringify(req.body));
  const currentParticipant = participant.from(req.body);
  console.log(JSON.stringify(currentParticipant));
  const id = req.body.participantid;
  participants.update(currentParticipant, id)
    .then(() => res.render('participants/success', {name: req.body.firstname + ' ' + req.body.lastname}))
    .catch(() => res.render('error', {message: "Es ist ein Fehler aufgetreten", error: {status: "Bitte versuche es nochmal"}}));
});

router.post('/delete', (req, res) => {
  if (canDeleteUser(req.user.role)) {
    const id = req.body.participantid;
    participants.delete(id)
      .then(() => res.redirect('/participants'))
      .catch(() => res.render('error', {message: "Es ist ein Fehler aufgetreten", error: {status: "Bitte versuche es nochmal"}}));
  } else {
    res.render('error', {
      message: 'Bitte anmelden',
      error: {
        status: 'Nur Administratoren können diese Seite einsehen'
      }
    });
  }

});

module.exports = router;
