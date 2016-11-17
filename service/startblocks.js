/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/util/dbHelper');
const moment = require('moment');
const _ = require('lodash');

let startblocks = {};

startblocks.add = (time,name) => {
  return db.insert('INSERT INTO startblocks(start_time,name) values($1,$2) returning id',[time,name]);
};

startblocks.editBlock = (time,name,id) => {
  return db.update('UPDATE startblocks set start_time=$1,name=$2 where id=$3',[time,name,id]);
};

startblocks.save = (req) => {
  req.block.forEach( (entry) => {
    let time = moment().hours(entry.hours).minutes(entry.minutes).seconds(entry.seconds).unix();
    if (entry.id != 0){
      startblocks.editBlock(time,entry.name,entry.id);
    } else {
      if (entry.hours != '') {
        startblocks.add(time,entry.name);
      }
    }
  });
  
};

startblocks.get = () => {
  return db.select('SELECT * from startblocks order by id').then( (blocks) => {
      _.each(blocks,(block,i) => {
        blocks[i].hours   = moment(block.start_time,'X').hours();
        blocks[i].minutes = moment(block.start_time,'X').minutes();
        blocks[i].seconds = moment(block.start_time,'X').seconds();
      });
      return blocks;
    });
};

module.exports = startblocks;
