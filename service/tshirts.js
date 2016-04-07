/* jshint node: true */
/* jshint esnext: true */
'use strict';

const db = require('../service/util/dbHelper');

let service = {};

service.addTShirt = function (tshirt, participantId) {
  return db.insert('insert into tshirts ' +
    '(size, model, participantId) ' +
    'values($1, $2, $3) returning id',
    [tshirt.size,
      tshirt.model,
      participantId]);
};

service.getTShirtFor = function (participantId) {
  return db.select('SELECT * FROM tshirts WHERE participantid = $1', [participantId]);
};

module.exports = service;
