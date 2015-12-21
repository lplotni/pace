/* jshint node: true */
'use strict';

var router = require('express').Router();
var _ = require('lodash');
var participants = require('../service/participants');
var accesscontrol = require('../acl/accesscontrol');
var isAuthenticated = require('../acl/authentication');
var calculator = require('../domain/costCalculator');

var canConfirmPayments = function (role) {
  return accesscontrol.hasPermissionTo(role, 'confirm payments');
};

router.get('/', isAuthenticated, function (req, res) {
  if (canConfirmPayments(req.user.role)) {
    participants.getRegistered().then(function (result) {
      res.render('paymentValidation/paymentValidation', {participants: result});
    });
  } else {
    var result = {
      message: 'Bitte anmelden',
      error: {
        status: 'Nur Administratoren können diese Seite einsehen'
      }
    };
    res.render('error', result);
  }
});

router.post('/', isAuthenticated, function (req, res) {
  if (canConfirmPayments(req.user.role)) {
    var paymentToken = req.body.paymenttoken;

    participants.getByToken(paymentToken)
      .then(function (result) {
        return res.render('paymentValidation/paymentValidation', {
          token: paymentToken,
          name: result.name,
          amount: calculator.priceFor(result),
          participantid: result.id
        });
      })
      .catch(function (error) {
        return res.render('paymentValidation/paymentValidation', {
          token: paymentToken,
          error: error.message
        });
      });
  }
});

router.post('/confirm', isAuthenticated, function (req, res) {
  if (canConfirmPayments(req.user.role)) {
    participants.confirmParticipant(req.body.participantid)
      .then(function () {
        if(_.contains(req.body.referer, 'payment_validation')) {
          res.render('paymentValidation/paymentValidation', {
            successMessage: 'Der Teilnehmer wurde bestätigt',
            token: req.body.paymenttoken,
            name: req.body.name,
            amount: req.body.amount,
            participantid: req.body.participantid
          });
        } else {
          var participants = JSON.parse(req.body.participants);
          res.redirect(req.get('referer'));
          res.render('participants/list', {participants: participants, isAdmin: true});
        }
      })
      .catch(function () {
        res.render('paymentValidation/paymentValidation', {
          error: 'Fehler: Der Teilnehmer konnte nicht bestätigt werden',
          token: req.body.paymenttoken,
          name: req.body.name,
          amount: req.body.amount,
          participantid: req.body.participantid
        });
      });
  }
});

module.exports = router;

