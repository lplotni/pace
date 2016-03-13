/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/dbHelper');

const registration = {};

registration.isClosed = () => {
  return db.select("SELECT data->>'is_closed' as is_closed FROM registration;")
    .then( result => {
      return result[0].is_closed === 'true';
    });
};

registration.close = () => {
  return db.update("UPDATE registration SET data = jsonb_set(data, '{is_closed}', 'true');");
};

registration.reopen = () => {
  return db.update("UPDATE registration SET data = jsonb_set(data, '{is_closed}', 'false');");
};

module.exports = registration;