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
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for( var i=0; i < 5; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

router.get('/', (req, res) => {
  res.render('registration/registration', {});
});

router.post('/', (req, res) => {
  try {
    const newParticipant = participant.from(req.body);
    const token = createUniqueToken();
    participants.register(newParticipant, token)
      .done(()  =>
        res.render('registration/success', {
          name: newParticipant.firstname + ' ' + newParticipant.lastname,
          token: token,
          amount: new Intl.NumberFormat('de-DE', {minimumFractionDigits: '2'}).format(calculator.priceFor(newParticipant)),
          link: ''
        }), err => res.send(err.message));
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
