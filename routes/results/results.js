/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');

router.get('/', (req, res) => {
  participants.results('f').then(f  => {
    participants.results('m').then(m  => {
      res.render('results/list', {participants_f: f, participants_m: m});
    });
  });
});

module.exports = router;
