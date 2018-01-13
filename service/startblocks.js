/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/util/dbHelper');
const participants = require('../service/participants');
const moment = require('moment');
const Q = require('q');
const _ = require('lodash');

const defaultColor = '#FFFFFF';
const isHexColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

let startblocks = {};

startblocks.add = (time, name, color) => {
  color = isHexColor.test(color) ? color : defaultColor;
  return db.insert('INSERT INTO startblocks(start_time,name, color) values($1,$2,$3) returning id', [time, name, color]);
};

startblocks.editBlock = (time, name, id) => {
  return db.update('UPDATE startblocks set start_time=$1,name=$2 where id=$3', [time, name, id]);
};

startblocks.save = (req) => {
  _.each(req.block,block => {
    let time = moment().hours(block.hours).minutes(block.minutes).seconds(block.seconds).unix();
    if (block.id != 0) {
      startblocks.editBlock(time, block.name, block.id);
    } else {
      if (block.hours != '') {
        startblocks.add(time, block.name);
      }
    }
  });

};

startblocks.times = () => {
  return db.select('SELECT start_time from startblocks order by id')
  .then((blocks) => {
    _.each(blocks, (block, i) => {
      blocks[i] = block.start_time;
    });
    return blocks;
  });
};

startblocks.all = () => {
 return db.select('SELECT id from startblocks');
};

startblocks.get = () => {
  return db.select('SELECT * from startblocks order by id').then((blocks) => {
    _.each(blocks, (block, i) => {
      blocks[i].hours = moment(block.start_time, 'X').hours();
      blocks[i].minutes = moment(block.start_time, 'X').minutes();
      blocks[i].seconds = moment(block.start_time, 'X').seconds();
    });
    return blocks;
  });
};

module.exports = startblocks;
