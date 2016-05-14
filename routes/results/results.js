/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const race = require('../../service/race');
const validator = require('validator');
const _ = require('lodash');

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

  if (!_.isEmpty(req.query.agegroup) && validator.isIn(req.query.agegroup, ['20-29', '31-35', '36-35', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80-120'])) {
    let ages = req.query.agegroup.split('-');
    return calc(ages[0], ages[1]);
  }
  return {max_year: now, min_year: 0};
}

router.get('/', (req, res) => {
  let ageGroups = extractAgeGroup(req);

  race.results(extractCategory(req), ageGroups.min_year, ageGroups.max_year)
    .then(list => {
      res.render('results/list', {list: list});
    })
    .catch(() => res.render('error', {
      message: "Es ist ein Fehler aufgetreten",
      error: {status: "Bitte versuche es nochmal"}
    }));
});

module.exports = router;
