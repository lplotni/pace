var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.renameColumn('participants', 'gender', 'category', callback);
};

exports.down = function(db, callback) {
  db.renameColumn('participants', 'category', 'gender', callback);
};
