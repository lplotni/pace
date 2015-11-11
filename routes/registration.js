'use strict';
/* jshint node: true */
/* jshint esnext: true */

const express = require('express');
const router = express.Router();

const participants = require('../service/participants');
const participant = require('../domain/participant');

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
    participants.register(newParticipant, token);
    res.render('registration/success', {
      name: newParticipant.firstname + ' ' + newParticipant.lastname,
      token: token,
      link: ''
    });
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
