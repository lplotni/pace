/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');

router.get('/', (req, res) => {
    res.render('results/list');
});

module.exports = router;
