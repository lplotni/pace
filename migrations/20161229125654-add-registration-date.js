var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('participants', 'registration_time', {type: 'datetime'}, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('participants', 'registration_time', callback);
};
