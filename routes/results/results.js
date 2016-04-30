/* jshint node: true */
/* jshint esnext: true */
'use strict';

const router = require('express').Router();
const participants = require('../../service/participants');

router.get('/', (req, res) => {
  var category_query='all';
  var max_year=2016;
  var min_year=0;
  var now = new Date().getFullYear();
  switch(req.query.category){
    case 'm':
      category_query= 'm';
      break;
    case 'f':
      category_query= 'f';
      break;
  }
  switch(req.query.agegroup){
    case '20-29':
      max_year= now - 20;
      min_year= now - 29;
      break;
    case '31-35':
      max_year= now - 31;
      min_year= now - 35;
      break;
    case '36-35':
      max_year= now - 35;
      min_year= now - 39;
      break;
    case '40-44':
      max_year= now - 40;
      min_year= now - 44;
      break;
    case '45-49':
      max_year= now - 45;
      min_year= now - 49;
      break;
    case '50-54':
      max_year= now - 50;
      min_year= now - 54;
      break;
    case '55-59':
      max_year= now - 55;
      min_year= now - 59;
      break;
    case '60-64':
      max_year= now - 60;
      min_year= now - 64;
      break;
    case '65-69':
      max_year= now - 65;
      min_year= now - 69;
      break;
    case '70-74':
      max_year= now - 70;
      min_year= now - 74;
      break;
    case '75-79':
      max_year= now - 75;
      min_year= now - 79;
      break;
    case '80-120':
      max_year= now - 80;
      min_year= now - 120;
      break;
  }
  console.log(req.query.agegroup);
  participants.results(category_query,min_year,max_year).then(list  => {
    res.render('results/list', {list: list});
  });
});

module.exports = router;
