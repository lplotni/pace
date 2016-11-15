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

const extractDataTablesParams = (req) => {
  const orderIndex = (req.query.order) ? req.query.order[0].column : 0;
  return {
    start: parseInt(req.query.start) || 0,
    length: parseInt(req.query.length) || 10,
    search: (req.query.search) ? (req.query.search.value || '') : '',
    orderText: (req.query.order) ? req.query.columns[orderIndex].data + ' ' + req.query.order[0].dir : undefined ,
    drawNum: req.query.draw,
  };
};

const generateDataTablesResponse = (resultPromise, drawNum, res) => {
  resultPromise.then((result) => {
      const ret = {
        draw: drawNum,
        recordsTotal: result.numberOfAllRecords,
        recordsFiltered: result.numberOfRecordsAfterFilter,
        data: result.records,
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(ret));
    })
    .catch((err) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(404) 
        .send(JSON.stringify({ status: 'Not Found' }));
  });
};

router.get('/participants', (req, res) => {
  const params = extractDataTablesParams(req);
  const resultPromise = participants.forDataTables(params.start, params.length, params.search, params.orderText);
  generateDataTablesResponse(resultPromise, params.drawNum, res);
});

function extractCategory(req) {
  if (!_.isEmpty(req.query.category) && validator.isIn(req.query.category, ['m', 'f', 'all'])) {
    return req.query.category;
  }
  return 'all';
}

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
  const params = extractDataTablesParams(req);
  const ageGroups = extractAgeGroup(req);
  const category = extractCategory(req); 
  const resultPromise = race.resultsForDataTables(params.start, params.length, 
    params.search, params.orderText, category, ageGroups.min_year, ageGroups.max_year);
  generateDataTablesResponse(resultPromise, params.drawNum, res);
});

module.exports = router;
