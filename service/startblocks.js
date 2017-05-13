/* jshint node: true */
/* jshint esnext: true */
'use strict';
const db = require('../service/util/dbHelper');
const participants = require('../service/participants');
const moment = require('moment');
const Q = require('q');
const _ = require('lodash');

let startblocks = {};

startblocks.add = (time, name) => {
  return db.insert('INSERT INTO startblocks(start_time,name) values($1,$2) returning id', [time, name]);
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

startblocks.assign = () => {
  const deferred = Q.defer();
  Q.all([participants.get.all(), db.select('SELECT id from startblocks')])
    .then((result) => {
    let totalAmount = result[0].length;
    let blocks = result[1];
    let amountPerBlock = Math.floor(totalAmount / blocks.length); //todo MOD ?
    let distribution = [];
    _.forEach(blocks,function(block,index){
        if(blocks.length != index+1) {
          distribution.push(amountPerBlock);
        } else { // last block: amountPerBlock + rest
          distribution.push(amountPerBlock + ( totalAmount % blocks.length ));
        }
      }); 
    deferred.resolve(distribution);
    });
  return deferred.promise;
};

module.exports = startblocks;
