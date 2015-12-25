var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.runSql("alter table participants alter column paymenttoken type VARCHAR(255);",callback);
};

exports.down = function(db, callback) {
  db.runSql("alter table participants alter column paymenttoken type VARCHAR(7);",callback);
};
