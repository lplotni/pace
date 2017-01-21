let moment = require('moment')
let starttime = moment().hours(10).minutes(0).seconds(0).unix();

var dbm = global.dbm || require('db-migrate');

exports.up = function(db, callback) {
  db.runSql("insert into startblocks (name,start_time) values ('Startblock1',"+ starttime +")", callback);
};

exports.down = function(db, callback) {
  db.runSql("delete from startblocks", callback);
};
