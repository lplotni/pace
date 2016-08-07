/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const _ = require('lodash');
const config = require('config');
const participants = require('../service/participants');

function checkToken(req) {
  return req.get('X-Pace-Token') === config.get('admin.token');
}

router.post('/scan', (req, res) => {
  if ( checkToken(req)) {
    participants.updateTime (req.body.startnumber,req.body.time)
    .then((result)  => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ status: 'OK' }));
    })
    .catch((err) => {
     res.setHeader('Content-Type', 'application/json');
     res.status(404) 
       .send(JSON.stringify({ status: 'Not Found' }));
   });
  } else {
     res.setHeader('Content-Type', 'application/json');
     res.status(403) 
       .send(JSON.stringify({ status: 'Not allowed' }));
  }
});

module.exports = router;
