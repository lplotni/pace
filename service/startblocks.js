/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/util/dbHelper');
const moment = require('moment');
const _ = require('lodash');

let startblocks = {};

startblocks.add = (name,time) => {
  return db.insert('INSERT INTO startblocks(name,start_time) values($1,$2) returning id',[name,time]);
};

startblocks.get = () => {
  return db.select('SELECT * from startblocks').then( (blocks) => {
      _.each(blocks,(block,i) => {
        blocks[i].hours   = moment(block.start_time,'X').hours();
        blocks[i].minutes = moment(block.start_time,'X').minutes();
        blocks[i].seconds = moment(block.start_time,'X').seconds();
      });
      return blocks;
    });
};

module.exports = startblocks;
