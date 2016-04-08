/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const registration = require('../../service/registration');
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');

let canConfirmPayments = (role) => accesscontrol.hasPermissionTo(role, 'confirm payments');


router.post('/confirm', isAuthenticated, (req, res) => {
  if (canConfirmPayments(req.user.role)) {
    registration.confirm(req.body.participantid)
      .then(() => res.redirect(req.get('referer')))
      .catch(() =>
        res.render('error', {
          message: 'Fehler: Der Teilnehmer konnte nicht bestätigt werden',
          error: {status: 'Fehler bei Teilnehmer ' + req.body.name + 'mit Token ' + req.body.paymenttoken}
        })
      );
  }
});

module.exports = router;

