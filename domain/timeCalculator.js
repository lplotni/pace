/* jshint node: true */
/* jshint esnext: true */
'use strict';

const moment = require('moment');
require("moment-duration-format"); 
let timeCalculator = {};

timeCalculator.timeString = (seconds) => {
  return moment.duration(parseInt(seconds),'seconds').format("hh:mm:ss", { trim: false} );
};

timeCalculator.timestamp = (timestring) => {
  let timestamp = moment.duration({
    hours: timestring.split(':')[0],
    minutes: timestring.split(':')[1],
    seconds: timestring.split(':')[2]
  });
  return timestamp.asSeconds();
};

timeCalculator.relativeTime = (startTimes, finishTime, block) => {
  const relativeTime = moment.duration( finishTime - startTimes[block-1], 'seconds');
  return [relativeTime.hours(), relativeTime.minutes(), relativeTime.seconds()];
};
timeCalculator.relativeSeconds = (startTimes, finishTime, block) => {
  const relativeTime = moment.duration(
    finishTime - startTimes[block], 'seconds');
  return relativeTime.asSeconds();
};


module.exports = timeCalculator;
