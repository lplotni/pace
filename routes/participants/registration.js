/* jshint node: true */
/* jshint esnext: true */
/* global Intl*/
'use strict';

const express = require('express');
const config = require('config');
const router = express.Router();

const participant = require('../../domain/participant');
const calculator = require('../../domain/costCalculator');
const editUrlHelper = require('../../domain/editUrlHelper');
const registration = require('../../service/registration');

router.get('/', (req, res) => {
  registration.isClosed().then(isClosed =>
    res.render('registration/registration', {registrationClosed: isClosed, shirts: config.get('shirts.models')}));
});

router.post('/', (req, res) => {
  try {
    const newParticipant = participant.from(req.body);
    registration.start(newParticipant)
      .done((result)  =>
        res.render('registration/success', {
          name: newParticipant.firstname + ' ' + newParticipant.lastname,
          bank: config.get('contact.bank'),
          token: result.token,
          amount: new Intl.NumberFormat('de-DE', {minimumFractionDigits: '2'}).format(calculator.priceFor(newParticipant)),
          editUrl: editUrlHelper.generateUrl(result.secureid),
          startnr: result.startnr
        }), err => res.render('failure', {
                        message: err.message
                    })
      );
  } catch (err) {
    res.render('failure', {
      message: err.message
    });
  }
});

module.exports = router;
