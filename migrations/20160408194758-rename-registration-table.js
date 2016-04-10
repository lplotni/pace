var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.renameTable('registration', 'race', callback);
};

exports.down = function(db, callback) {
  db.renameTable('race', 'registration', callback);
};
