/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const router = require('express').Router();
const moment = require('moment');
const multiparty = require('multiparty');
const form = new multiparty.Form();
const accesscontrol = require('../../acl/accesscontrol');
const isAuthenticated = require('../../acl/authentication');
const race = require('../../service/race');

router.get('/', isAuthenticated, (req, res) => {
  race.hasStarted()
    .then((result) => {
      if (result === true) {
        race.startTime()
          .then( function(timestamp) {
            let time = moment(timestamp,'X');
            res.render('admin/after', {hours:time.hours(), minutes: time.minutes(), seconds: time.seconds(),isAdmin: true,csrf:req.csrfToken()});
          });
      } else {
        res.render('admin/after', {hours:'', minutes: '', seconds:'',isAdmin: true,csrf:req.csrfToken()});
      }
    });
});

router.post('/', (req, res) => {
  let time = moment();
  time.hours(req.body.hours);
  time.minutes(req.body.minutes);
  time.seconds(req.body.seconds);
  race.setStartTime(time.unix());
  res.redirect('/admin/after');
});

router.post('/import', isAuthenticated, (req, res) => {
    var util = require('util');
    form.parse(req);
    form.on('file', function(name,file){
      race.import(file.path)
      .then( () => res.redirect('/admin/after'));
    });
});


module.exports = router;
