/* jshint node: true */
/* jshint esnext: true */
'use strict';

const moment = require('moment');
let timeCalculator = {};

timeCalculator.timestamp = (startTimes, timestring) => {
  let timestamp = moment(startTimes.block1, 'X');
  timestamp.hours(timestring.split(':')[0]);
  timestamp.minutes(timestring.split(':')[1]);
  timestamp.seconds(timestring.split(':')[2]);
  return timestamp.unix();
};

timeCalculator.getCorrectStartTime = (startTimes, block) => {
  if (block === 1) {
    return startTimes.block1;
  }
  if (block === 2) {
    return startTimes.block2;
  }
  throw new Error(`Block not recognized: ${block}`);
};

timeCalculator.relativeTime = (startTimes, finishTime, block) => {
  const relativeTime = moment.duration(
    finishTime - timeCalculator.getCorrectStartTime(startTimes, block), 'seconds');
  return [relativeTime.hours(), relativeTime.minutes(), relativeTime.seconds()];
};
timeCalculator.relativeSeconds = (startTimes, finishTime, block) => {
  const relativeTime = moment.duration(
    finishTime - timeCalculator.getCorrectStartTime(startTimes, block), 'seconds');
  return relativeTime.asSeconds();
};


module.exports = timeCalculator;
