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
const editUrlHelper = require('../../domain/editUrlHelper');

router.get('/', (req, res) => {
  res.render('registration/registration', {});
});

router.post('/', (req, res) => {
  try {
    const newParticipant = participant.from(req.body);
    participants.register(newParticipant)
      .done((result)  =>
        res.render('registration/success', {
          name: newParticipant.firstname + ' ' + newParticipant.lastname,
          bank: config.get('contact.bank'),
          token: result.token,
          amount: new Intl.NumberFormat('de-DE', {minimumFractionDigits: '2'}).format(calculator.priceFor(newParticipant)),
          editUrl: editUrlHelper.generateUrl(result.secureid)
        }), err => res.send(err.message));
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
