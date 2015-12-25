/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const passport = require('passport');

router.get('/', (req, res) =>
  res.render('login', { error: req.flash('error') })
);

router.post('/',
  passport.authenticate('local',
    { successRedirect: '/admin',
      failureRedirect: '/login',
      failureFlash: true }
  )
);

module.exports = router;
