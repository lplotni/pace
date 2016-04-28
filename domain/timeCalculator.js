/* jshint node: true */
/* jshint esnext: true */
'use strict';

const moment = require('moment');
const race = require('../service/race');


let timeCalculator = {};

timeCalculator.timestamp = function(timestring) {
  return race.startTime()
    .then( starttime => {
      let timestamp = moment(starttime,'X');
      timestamp.hours(timestring.split(':')[0]);
      timestamp.minutes(timestring.split(':')[1]);
      timestamp.seconds(timestring.split(':')[2]);
      return timestamp.unix();
    });
};

timeCalculator.relativeTime = function(race_starttime,participant_finishtime) {
  const deferred = Q.defer();
  var relative_time = moment.duration(participant_finishtime - race_starttime,'seconds');
  deferred.resolve([relative_time.hours(),relative_time.minutes(),relative_time.seconds()]);
  return deferred.promise;
};

module.exports = timeCalculator;
