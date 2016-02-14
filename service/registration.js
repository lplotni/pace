/* jshint node: true */
/* jshint esnext: true */
'use strict';

const registration = {};

// TODO: make the status persistent. Maybe in the DB or in the config?
let isClosed = false;

registration.isClosed = () => {
  return isClosed;
};

registration.close = () => {
  isClosed = true;
};

module.exports = registration;