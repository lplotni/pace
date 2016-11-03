/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const race = require('../../service/race');
const validator = require('validator');

router.get('/', (req, res) => {
  res.render('results/list');
});

module.exports = router;
