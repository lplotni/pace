/* jshint node: true */
/* jshint esnext: true */
'use strict';

const moment = require('moment');
let timeCalculator = {};

timeCalculator.timestamp = (startTime, timestring) => {
  let timestamp = moment(startTime.block1, 'X'); //TODO use either block1 or block2
  timestamp.hours(timestring.split(':')[0]);
  timestamp.minutes(timestring.split(':')[1]);
  timestamp.seconds(timestring.split(':')[2]);
  return timestamp.unix();
};

timeCalculator.relativeTime = (race_starttime, participant_finishtime) => {
  const relative_time = moment.duration(participant_finishtime - race_starttime, 'seconds');
  return [relative_time.hours(), relative_time.minutes(), relative_time.seconds()];
};

module.exports = timeCalculator;
