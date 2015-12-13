var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
  db.addColumn('participants', 'birthyear', {type: 'integer'}, callback);
};

exports.down = function (db, callback) {
  db.removeColumn('participants', 'birthyear', callback);
};
