/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/util/dbHelper');
const _ = require('lodash');
const Q = require('q');
const moment = require('moment');

let race = {};

race.startTime = function () {
  return db.select("SELECT data->>'starttime' as starttime FROM race;")
    .then( result => {
      return result[0].starttime;
    });
};

race.startTimeArray = function() {
  race.startTime()
    .then( result => {
      let time = moment(result,'x');
      return [time.hours(), time.minutes(), time.seconds()];
    });
};
race.setStartTime = function (date) {
  let query = "UPDATE race SET data = jsonb_set(data, '{starttime}','" + date + "');"
  return db.update(query);
};

race.hasStarted = () => {
  const deferred = Q.defer();
  db.select("SELECT data->>'starttime' as starttime FROM race;")
    .then( result => {
      if(result[0].starttime == null) {
        deferred.resolve(false);
      } else {
        deferred.resolve(true);
      };
    });
    return deferred.promise;
};

race.resetStarttime = () => {
  let query = 'UPDATE race SET data = jsonb_object(\'{"is_closed",false}\')'; 
  return db.update(query);
};


module.exports = race;
