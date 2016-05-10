/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Q = require('q');
const moment = require('moment');
const race = require('../service/race');


let timeCalculator = {};

timeCalculator.timestamp = function(timestring) {
  const deferred = Q.defer();
  race.startTime()
    .then( starttime => {
      let timestamp = moment(starttime,'X');
      timestamp.hours(timestring.split(':')[0]);
      timestamp.minutes(timestring.split(':')[1]);
      timestamp.seconds(timestring.split(':')[2]);
      deferred.resolve(timestamp.unix());
    })
    .fail(deferred.reject);
  return deferred.promise;
};

module.exports = timeCalculator;
