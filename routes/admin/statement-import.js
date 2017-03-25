/* jshint node: true */
/* jshint esnext: true */
'use strict';

const multiparty = require('multiparty');
const router = require('express').Router();
const isAuthenticated = require('../../acl/authentication');
const race = require('../../service/race');
const participants = require('../../service/participants');

router.post('/', isAuthenticated, (req, res) => {
  const form = new multiparty.Form();
  form.parse(req);
  form.on('file', function (name, file) {
    race.parsePaymentCSV(file.path)
      .then((tokens) => {
          var participants_found = [];
          tokens.forEach((token) => {
            participants.markPayedByToken(token)
            .then((id) => {
              participants_found.push([id,token]);
              console.log(participants_found); // content is printed here
            });
            console.log(participants_found); // content is empty here
          });
          res.render('admin/statement-import', {participants: participants_found});
      });
  });
  form.on('error', function (err) {
    console.log(err);
  });
});

module.exports = router;
