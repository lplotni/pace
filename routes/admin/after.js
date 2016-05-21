/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const moment = require('moment');
const multiparty = require('multiparty');
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const race = require('../../service/race');
//TODO Rename the whole file  -> Race? Results?
router.get('/', isAuthenticated, (req, res) => {
  race.hasStarted()
    .then((result) => {
      if (result === true) {
        race.startTime()
          .then((times) => {
            res.render('admin/after', {
              hours1: moment(times.block1, 'X').hours(),  //TODO -> Extract to a proper object
              minutes1: moment(times.block1, 'X').minutes(),
              seconds1: moment(times.block1, 'X').seconds(),
              hours2: moment(times.block2, 'X').hours(),
              minutes2: moment(times.block2, 'X').minutes(),
              seconds2: moment(times.block2, 'X').seconds(),
              isAdmin: true,
              csrf: req.csrfToken()
            });
          });
      } else {
        res.render('admin/after', {hours: '', minutes: '', seconds: '', isAdmin: true, csrf: req.csrfToken()});
      }
    });
});

function extractTimes(req) { //TODO pull into the 'proper' object
  let time1 = moment();
  time1.hours(req.body.hours1);
  time1.minutes(req.body.minutes1);
  time1.seconds(req.body.seconds1);

  let time2 = moment();
  time2.hours(req.body.hours2);
  time2.minutes(req.body.minutes2);
  time2.seconds(req.body.seconds2);

  return {block1: time1.unix(), block2: time2.unix()};
}

router.post('/', (req, res) => {
  race.setStartTime(extractTimes(req)); //todo why do we ignore the result?
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
