/* jshint node: true */
/* jshint esnext: true */
/* global Intl*/
'use strict';

const express = require('express');
const config = require('config');
const router = express.Router();

const participants = require('../../service/participants');
const participant = require('../../domain/participant');
const calculator = require('../../domain/costCalculator');

function createUniqueToken() {
  return Math.random().toString(32).substring(2);
}

router.get('/', function (req, res) {
  res.render('registration/registration', {});
});

router.post('/', function (req, res) {
  try {
    const newParticipant = participant.from(req.body);
    const token = createUniqueToken();
    participants.register(newParticipant, token)
      .done(function () {
        res.render('registration/success', {
          name: newParticipant.firstname + ' ' + newParticipant.lastname,
          token: token,
          amount: new Intl.NumberFormat('de-DE', {minimumFractionDigits: '2'}).format(calculator.priceFor(newParticipant)),
          link: ''
        });
      }, function (err) {
        res.send(err.message);
      });
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
