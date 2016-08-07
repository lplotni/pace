/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const config = require('config');
const participants = require('../service/participants');

let tokenValidator = function(req,res,next) {
  if (req.get('X-Pace-Token') === config.get('admin.token')) {
    return next();
  } else {
     res.setHeader('Content-Type', 'application/json');
     res.status(403) 
       .send(JSON.stringify({ status: 'Not allowed' }));
  }
};

router.post('/scan',tokenValidator, (req, res) => {
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
});

module.exports = router;
