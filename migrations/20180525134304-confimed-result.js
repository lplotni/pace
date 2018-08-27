
var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('participants', 'confirmed_result', {type: 'boolean', defaultValue:'false'}, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('participants', 'confirmed_result', callback);
};

