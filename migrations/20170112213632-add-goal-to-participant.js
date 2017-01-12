var dbm = global.dbm || require('db-migrate');

exports.up = function(db, callback) {
  db.addColumn('participants', 'goal', {type: 'string'}, callback);
};

exports.down = function(db, callback) {
  db.removeColumn('participants', 'goal', callback);
};
