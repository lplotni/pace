/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const config = require('config');
const participants = require('../service/participants');
const race = require('../service/race');
const _ = require('lodash');
const validator = require('validator');

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

router.get('/participants', (req, res) => {
  const drawNum = req.query.draw;
  // TODO: parse or default!
  const start = parseInt(req.query.start);
  const length = parseInt(req.query.length);
  const search = req.query.search.value;
  const orderIndex = req.query.order[0]['column'];
  const orderText = req.query.columns[orderIndex]['data'] + ' ' + req.query.order[0]['dir'];
  participants.publiclyVisibleF(start, length, search, orderText)
    .then((result) => {
      const ret = {
        draw: drawNum,
        recordsTotal: result[0][0].count,
        recordsFiltered: result[1][0].count,
        data: result[2],
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(ret));
    })
    .catch((err) => {
     res.setHeader('Content-Type', 'application/json');
     res.status(404) 
       .send(JSON.stringify({ status: 'Not Found' }));
   });
});

// TODO: cleanup
function extractCategory(req) {
  if (!_.isEmpty(req.query.category) && validator.isIn(req.query.category, ['m', 'f', 'all'])) {
    return req.query.category;
  }
  return 'all';
}

// TODO: cleanup
function extractAgeGroup(req) {
  const now = new Date().getFullYear();

  function calc(min, max) {
    return {max_year: now - min, min_year: now - max};
  }

  if (!_.isEmpty(req.query.agegroup) && validator.isIn(req.query.agegroup, ['20-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-120'])) {
    let ages = req.query.agegroup.split('-');
    return calc(ages[0], ages[1]);
  }
  return {max_year: now, min_year: 0};
}

router.get('/results', (req, res) => {
  const drawNum = req.query.draw;
  // TODO: parse or default!
  const start = parseInt(req.query.start);
  const length = parseInt(req.query.length);
  const search = req.query.search.value;
  const orderIndex = req.query.order[0]['column'];
  const orderText = req.query.columns[orderIndex]['data'] + ' ' + req.query.order[0]['dir'];

  let ageGroups = extractAgeGroup(req);
  
  race.resultsF(start, length, search, orderText, extractCategory(req), ageGroups.min_year, ageGroups.max_year)
    .then((result) => {
      const ret = {
        draw: drawNum,
        recordsTotal: result[0][0].count,
        recordsFiltered: result[1][0].count,
        data: result[2],
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(ret));
    })
    .catch((err) => {
      console.log(err);
     res.setHeader('Content-Type', 'application/json');
     res.status(404) 
       .send(JSON.stringify({ status: 'Not Found' }));
   });
});

module.exports = router;
