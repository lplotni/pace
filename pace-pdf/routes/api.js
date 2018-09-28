/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const _ = require('lodash');
const pdfGeneration = require('../pdf/pdfGeneration');

router.get('/certificates', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment');
  res.setHeader('Content-type', 'application/zip');
  pdfGeneration.zip(res);
});

module.exports = router;
