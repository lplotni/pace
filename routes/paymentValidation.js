/* jshint node: true */
'use strict';

var router = require('express').Router();
var participants = require('../service/participants');

router.get('/', function (req, res) {
    res.render('paymentValidation/paymentValidation', {});
});

router.post('/', function(req, res) {
    var paymentToken = req.body.paymenttoken;

    participants.getByToken(paymentToken)
      .then(function (result) {
          return res.render('paymentValidation/paymentValidation', {
              token: paymentToken,
              name: result.name,
              amount: result.amount,
              participantid: result.id
          });
      })
      .catch(function (result) {
          return res.render('paymentValidation/paymentValidation', {
              token: paymentToken,
              error: result.error
          });
      });
});

router.post('/confirm', function(req, res) {
  participants.confirmParticipant(req.body.participantid)
    .then(function() {
      res.render('paymentValidation/paymentValidation', {
        success_message: "Der Teilnehmer wurde bestätigt",
        token: req.body.paymenttoken,
        name: req.body.name,
        amount: req.body.amount,
        participantid: req.body.participantid
      });
    })
    .catch(function() {
      res.render('paymentValidation/paymentValidation', {
        error: "Fehler: Der Teilnehmer konnte nicht bestätigt werden",
        token: req.body.paymenttoken,
        name: req.body.name,
        amount: req.body.amount,
        participantid: req.body.participantid
      });
    });
});

module.exports = router;
