/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');
const participant = require('../../domain/participant');
const editUrlHelper = require('../../domain/editUrlHelper');

const accesscontrol = require('../../acl/accesscontrol');

var canDeleteUser = function (role) {
  return accesscontrol.hasPermissionTo(role, 'delete');
};

router.get('/:secureId', (req, res) => {
  const participantId = req.params.secureId;
  participants.getFullInfoBySecureId(participantId)
  .then(p => res.render('participants/editParticipant', {participant: p, participantid: participantId, isAdmin: true}))
    .catch( () =>
      res.render('error', {
        message: "Teilnehmer nicht bekannt",
        error: {status: "Möglicherweise wurde ein falscher Link verwendet"}
      })
    );
});

router.post('/', (req, res) => {
  const currentParticipant = participant.from(req.body);
  const id = req.body.participantid;
  participants.update(currentParticipant, id)
    .then(() => res.render('participants/success', {name: req.body.firstname + ' ' + req.body.lastname, isAdmin: true}))
    .catch(() => res.render('error', {message: "Es ist ein Fehler aufgetreten", error: {status: "Bitte versuche es nochmal"}}));
});

router.post('/delete', (req, res) => {
  if (canDeleteUser(req.user.role)) {
    const id = req.body.participantid;
    participants.delete(id)
      .then(() => res.redirect('/admin/participants'))
      .catch(() => res.render('error', {message: "Es ist ein Fehler aufgetreten", error: {status: "Bitte versuche es nochmal"}, isAdmin: true}));
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
