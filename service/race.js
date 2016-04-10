/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/util/dbHelper');
const participant = require('../service/participants');
const _ = require('lodash');
const Q = require('q');
const moment = require('moment');
const csv = require('fast-csv');
const fs = require('fs');



let race = {};

race.startTime = function () {
  return db.select("SELECT data->>'starttime' as starttime FROM race;")
    .then( result => {
      return result[0].starttime;
    });
};

race.startTimeArray = function() {
  race.startTime()
    .then(result => {
      let time = moment(result,'x');
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
    .then( result => {
      if(_.isEmpty(result[0].starttime)) {
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

race.import = function (file) {
  const deferred = Q.defer();
  csv
   .fromPath(file)
   .on("data", function(data){
      participant.insertTime(data[1],data[2]);
      })
   .on("end", function(){
      deferred.resolve();
      });
  return deferred.promise;
};



module.exports = race;
