/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const passport = require('passport');

router.get('/', (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
