/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const _ = require('lodash');
const participants = require('../service/participants');

router.post('/scan', (req, res) => {
    participants.updateTime (req.body.startnumber,req.body.time)
    .then((result)  => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ status: 'OK' }));
    })
    .catch((err) => {
     res.setHeader('Content-Type', 'application/json');
     res.status(400) 
       .send(JSON.stringify({ status: 'Bad Request' }));
   });
});

module.exports = router;
