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

race.startTime = () => {
  return db.select("select data->>'startTimes' as times from race;").then(result => {
    if (_.isNumber(_.toInteger(result[0].times.block1))) {
      return JSON.parse(result[0].times);
    }
    throw new Error(`StartTime.block1 not set or not a valid number: ${result[0].times.block1}`);
  });
};

race.setStartTime = (times) => {
  return db.update(`UPDATE race SET data = jsonb_set(data, '{startTimes}','{"block1": ${times.block1}, "block2": ${times.block2}}');`);
};

race.hasStarted = () => { //rename to something different?
  return db.select("SELECT data->'startTimes'->>'block1' as block1 FROM race;")
    .then(result =>  !_.isEmpty(result[0].block1));
};

race.resetStarttime = () => {
  return db.update(`UPDATE race SET data = jsonb_object('{"is_closed",false}')`);
};

race.parse = (file) => {
  const deferred = Q.defer();
  var results = {};
  csv
    .fromPath(file)
    .on("data", (data) => {
      results[data[1]] = data[2];
    })
    .on("end", () => deferred.resolve(results));
  return deferred.promise;
};

race.import = (file) => {
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

race.results = (category, agegroup_start, agegroup_end) => {
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
