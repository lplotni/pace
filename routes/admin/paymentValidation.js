/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const calculator = require('../../domain/costCalculator');

var canConfirmPayments = function (role) {
  return accesscontrol.hasPermissionTo(role, 'confirm payments');
};

router.get('/', isAuthenticated, (req, res) => {
  if (canConfirmPayments(req.user.role)) {
    participants.getRegistered().then(result => res.render('paymentValidation/paymentValidation', {
      participants: result,
      isAdmin: true
    })); //todo catch
  } else {
    res.render('error', {
      message: 'Bitte anmelden',
      error: {
        status: 'Nur Administratoren können diese Seite einsehen'
      }
    });
  }
});

router.post('/', isAuthenticated, (req, res) => {
  if (canConfirmPayments(req.user.role)) {
    const paymentToken = req.body.paymenttoken;

    participants.getByToken(paymentToken)
      .then(result =>
        res.render('paymentValidation/paymentValidation', {
          token: paymentToken,
          name: result.name,
          amount: calculator.priceFor(result),
          participantid: result.id,
          isAdmin: true
        })
      )
      .catch(error =>
        res.render('paymentValidation/paymentValidation', {
          token: paymentToken,
          error: error.message,
          isAdmin: true
        })
      );
  }
});

router.post('/confirm', isAuthenticated, (req, res) => {
  if (canConfirmPayments(req.user.role)) {
    participants.confirmParticipant(req.body.participantid)
      .then(() => res.redirect(req.get('referer')))
      .catch(() =>
        res.render('paymentValidation/paymentValidation', {
          error: 'Fehler: Der Teilnehmer konnte nicht bestätigt werden',
          token: req.body.paymenttoken,
          name: req.body.name,
          amount: req.body.amount,
          participantid: req.body.participantid,
          isAdmin: true
        })
      );
  }
});

module.exports = router;

