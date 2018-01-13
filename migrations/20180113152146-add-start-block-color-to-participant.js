var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.addColumn('participants', 'start_block_color', {type: 'string', defaultValue: '#FFFFFF'}, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('participants', 'start_block_color', callback);
};
