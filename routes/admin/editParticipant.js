/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');
const participant = require('../../domain/participant');
const editUrlHelper = require('../../domain/editUrlHelper');
const accesscontrol = require('../../acl/accesscontrol');

let canDeleteUser = (role) => accesscontrol.hasPermissionTo(role, 'delete');

router.get('/:secureId', (req, res) => {
  const participantId = req.params.secureId;
  participants.bySecureId(participantId)
  .then(p => res.render('admin/editParticipant', {participant: p, participantid: participantId}))
    .catch( () =>
      res.render('error', {
        message: "Teilnehmer nicht bekannt",
        error: {status: "Möglicherweise wurde ein falscher Link verwendet"}
      })
    );
});

router.post('/', (req, res) => {
  participants.update(participant.from(req.body), req.body.participantid)
    .then(() => res.render('participants/success', {name: req.body.firstname + ' ' + req.body.lastname}))
    .catch(() => res.render('error', {message: "Es ist ein Fehler aufgetreten", error: {status: "Bitte versuche es nochmal"}}));
});

router.post('/delete', (req, res) => {
  if (canDeleteUser(req.user.role)) {
    participants.delete(req.body.participantid)
      .then(() => res.redirect('/admin/participants'))
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
