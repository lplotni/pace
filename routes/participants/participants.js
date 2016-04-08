/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');
const accesscontrol = require('../../acl/accesscontrol');

let useDefaultAuthentication = (req, res, next) => {
  if (req.user) {
    return next();
  } else {
    let user = {username: 'guest', role: 'guest'};
    req.logIn(user, next);
  }
};

router.get('/', useDefaultAuthentication, (req, res) => {
  participants.publiclyVisible().then(result  =>
    res.render('participants/list', {participants: result})
  );
});

module.exports = router;
