/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const _ = require('lodash');

router.get('/certificates', (req, res) => {
  res.send("aaah")
});

module.exports = router;
