/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/dbHelper');

const registration = {};

registration.isClosed = () => {
  return db.select("select is_closed from registration limit 1;")
    .then( result => {
      return result[0].is_closed;
    });
};

registration.close = () => {
  return db.update("UPDATE registration set is_closed = 'yes' where is_closed = $1;", ['no']);
};

registration.reopen = () => {
  return db.update("UPDATE registration set is_closed = 'no' where is_closed = $1;", ['yes']);
};

module.exports = registration;