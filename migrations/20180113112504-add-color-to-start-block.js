var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('startblocks', 'color', {type: 'string', defaultValue: '#FFFFFF'}, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('startblocks', 'color', callback);
};
