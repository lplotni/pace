/* jshint node: true */
/* jshint esnext: true */
'use strict';

const moment = require('moment');
let timeCalculator = {};

timeCalculator.timestamp = (timestring) => {
  let timestamp = moment.duration({
    hours: timestring.split(':')[0],
    minutes: timestring.split(':')[1],
    seconds: timestring.split(':')[2]
  });
  return timestamp.asSeconds();
};

timeCalculator.relativeTime = (startTimes, finishTime, block) => {
  const relativeTime = moment.duration( finishTime - startTimes[block], 'seconds');
  return [relativeTime.hours(), relativeTime.minutes(), relativeTime.seconds()];
};
timeCalculator.relativeSeconds = (startTimes, finishTime, block) => {
  const relativeTime = moment.duration(
    finishTime - startTimes[block], 'seconds');
  return relativeTime.asSeconds();
};


module.exports = timeCalculator;
