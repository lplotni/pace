/* jshint node: true */
/* jshint esnext: true */
'use strict';

const moment = require('moment');
let timeCalculator = {};

timeCalculator.timestamp = (startTime, timestring) => {
  let timestamp = moment(startTime.block1, 'X');
  timestamp.hours(timestring.split(':')[0]);
  timestamp.minutes(timestring.split(':')[1]);
  timestamp.seconds(timestring.split(':')[2]);
  return timestamp.unix();
};

timeCalculator.getCorrectStartTime = (startTimes, startNumber) => {
  if (startNumber < 1001) {
    return startTimes.block1;
  }
  return startTimes.block2;
};

timeCalculator.relativeTime = (startTimes, finishTime, startNumber) => {
  const relativeTime = moment.duration(
    finishTime - timeCalculator.getCorrectStartTime(startTimes, startNumber), 'seconds');
  return [relativeTime.hours(), relativeTime.minutes(), relativeTime.seconds()];
};

module.exports = timeCalculator;
