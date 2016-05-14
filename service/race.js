/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');
const _ = require('lodash');
const Q = require('q');
const moment = require('moment');
const csv = require('fast-csv');
const timeCalculator = require('../domain/timeCalculator');

let race = {};

race.startTime = function () {
  return db.select("SELECT data->>'starttime' as starttime FROM race;").then(result => {
    if (_.isNumber(_.toInteger(result[0].starttime))) {
      return result[0].starttime;
    }
    throw new Error(`StartTime not set or not a valid number: ${result[0].starttime}`);
  });
};

race.setStartTime = function (date) {
  return db.update(`UPDATE race SET data = jsonb_set(data, '{starttime}','${date}');`);
};

race.hasStarted = () => {
  return db.select("SELECT data->>'starttime' as starttime FROM race;")
    .then(result => !_.isEmpty(result[0].starttime));
};

race.resetStarttime = () => {
  return db.update(`UPDATE race SET data = jsonb_object('{"is_closed",false}')`);
};

race.parse = function (file) {
  const deferred = Q.defer();
  var results = {};
  csv
    .fromPath(file)
    .on("data", function (data) {
      results[data[1]] = data[2];
    })
    .on("end", function () {
      deferred.resolve(results);
    });
  return deferred.promise;
};

race.import = function (file) {
  const participant = require('../service/participants');
  race.parse(file)
    .then(result => {
      Object.keys(result).forEach(function (key) {
        participant.insertTime(key, result[key]);
      });
    });
};

function queryFor(category) {
  if (category === 'all') {
    return "";
  } else {
    return `and category= '${category}'`;
  }
}

race.results = function (category, agegroup_start, agegroup_end) {
  const deferred = Q.defer();

  let query = `select id,firstname,lastname,team,start_number,time,visibility from participants 
               where visibility='yes' and time > 0 
               ${queryFor(category)} 
               and birthyear >= ${agegroup_start} 
               and birthyear <= ${agegroup_end} 
               order by time`;

  db.select(query)
    .then((result) => {
      var place = 1;
      race.startTime()
        .then(start => {
          _.forEach(result, participant => {
            let time = timeCalculator.relativeTime(start, participant.time);
            participant.place = place++;
            participant.timestring = time[0] + ':' + time[1] + ':' + time[2];
          });
          deferred.resolve(result);
        }).catch(deferred.reject);
    }).catch(deferred.reject);

  return deferred.promise;
};


module.exports = race;
