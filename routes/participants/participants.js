/* jshint node: true */
/* jshint esnext: true */
'use strict';

var router = require('express').Router();
var participants = require('../../service/participants');
var accesscontrol = require('../../acl/accesscontrol');
var editUrlGenerator = require('../../domain/editUrlGenerator');

var useDefaultAuthentication = function (req, res, next) {
  if (req.user) {
    return next();
  } else {
    var user = {username: 'guest', role: 'guest'};
    req.logIn(user, next);
  }
};

router.get('/', useDefaultAuthentication, (req, res) => {
  participants.getPubliclyVisible().then(result  =>
    res.render('participants/list', {participants: result})
  );
});

module.exports = router;
