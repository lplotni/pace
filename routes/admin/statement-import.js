/* jshint node: true */
/* jshint esnext: true */
'use strict';

const multiparty = require('multiparty');
const router = require('express').Router();
const isAuthenticated = require('../../acl/authentication');
const race = require('../../service/race');

router.post('/', isAuthenticated, (req, res) => {
  const form = new multiparty.Form();
  form.parse(req);
  form.on('file', function (name, file) {
    race.parsePaymentCSV(file.path);
  });
  form.on('close', function () {
    res.render('admin/statement-import', {});
  });
  form.on('error', function (err) {
    console.log(err);
  });
});

module.exports = router;
