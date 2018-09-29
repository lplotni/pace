/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const _ = require('lodash');
const pdfGeneration = require('../pdf/pdfGeneration');

router.get('/', (req, res) => {
    res.sendStatus(200)
});

module.exports = router;
