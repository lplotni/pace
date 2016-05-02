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

race.startTimeArray = function () {
  race.startTime()
    .then(result => {
      let time = moment(result, 'x');
      return [time.hours(), time.minutes(), time.seconds()];
    });
};
race.setStartTime = function (date) {
  let query = "UPDATE race SET data = jsonb_set(data, '{starttime}','" + date + "');";
  return db.update(query);
};

race.hasStarted = () => {
  const deferred = Q.defer();
  db.select("SELECT data->>'starttime' as starttime FROM race;")
    .then(result => {
      if (_.isEmpty(result[0].starttime)) {
        deferred.resolve(false);
      } else {
        deferred.resolve(true);
      }
    });
  return deferred.promise;
};

race.resetStarttime = () => {
  let query = 'UPDATE race SET data = jsonb_object(\'{"is_closed",false}\')';
  return db.update(query);
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

race.results = function (category,agegroup_start,agegroup_end) {
  const deferred = Q.defer();
  var query='';
  if ( category === 'all')  { 
    query = 'select id,firstname,lastname,team,start_number,time,visibility from participants where visibility=\'yes\' and time > 0 and birthyear >= ' + agegroup_start + ' and birthyear <= '+ agegroup_end +' order by time';
  } else {
    query = 'select id,firstname,lastname,team,start_number,time,visibility from participants where visibility=\'yes\' and time > 0 and category= \''+ category + '\' and birthyear >= ' + agegroup_start + ' and birthyear <= '+ agegroup_end +' order by time';
  }
  db.select(query)
    .then((result) => {
      var place =1;
      race.startTime()
      .then (start => {
        _.forEach(result, participant => {
          participant.place = place++;
          timeCalculator.relativeTime(start,participant.time)
            .then((time) => {
              participant.timestring = time[0] + ':' + time[1] + ':' + time[2];
            });
        });
      })
      .then(() => {
        deferred.resolve(result);
      });
  });
  return deferred.promise;
};


module.exports = race;
