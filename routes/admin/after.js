/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const moment = require('moment');
const multiparty = require('multiparty');
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const race = require('../../service/race');
const startblocks = require('../../service/startblocks');
//TODO Rename the whole file  -> Race? Results?
router.get('/', isAuthenticated, (req, res) => {
            startblocks.get()
              .then((blocks) => {
                res.render('admin/after', {
                  isAdmin: true,
                  blocks: blocks,
                  csrf: req.csrfToken()
                });
              });
});

function extractTimes(req) { //TODO pull into the 'proper' object
  let time1 = moment.duration({seconds: req.body.seconds1, minutes: req.body.minutes1, hours: req.body.hours1}).asSeconds();
  let time2 = moment.duration({seconds: req.body.seconds2, minutes: req.body.minutes2, hours: req.body.hours2}).asSeconds();
  return {block1: time1, block2: time2};
}

router.post('/', isAuthenticated, (req, res) => {
  startblocks.save(req.body);

  res.redirect('/admin/after');
});

router.post('/import', isAuthenticated, (req, res) => {
  const form = new multiparty.Form();
  form.parse(req);
  form.on('file', function (name, file) {
    race.import(file.path);
  });
  form.on('close', function () {
    res.redirect('/admin/after');
  });
  form.on('error', function (err) {
    console.log(err);
  });
});


module.exports = router;
