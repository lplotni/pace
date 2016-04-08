/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/util/dbHelper');
const _ = require('lodash');

let race = {};

race.startTime = function () {
  return db.select("SELECT data->>'starttime' as starttime FROM registration;")
    .then( result => {
      return result[0].starttime;
    });
};

race.setStartTime = function (date) {
  let query = "UPDATE registration SET data = jsonb_set(data, '{starttime}','" + date + "');"
  return db.update(query);
};

module.exports = race;
