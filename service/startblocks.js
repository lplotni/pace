/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/util/dbHelper');
const _ = require('lodash');

let startblocks = {};

startblocks.add = (name) => {
  return db.insert('INSERT INTO startblocks(name) values($1) returning id',[name]);
};

startblocks.get = () => {
  return db.select('SELECT * from startblocks');
};

module.exports = startblocks;
