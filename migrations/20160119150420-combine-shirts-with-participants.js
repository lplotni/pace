var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.dropTable('tshirts', callback);

  db.runSql("CREATE TYPE shirtsize AS ENUM ('XS', 'S', 'M', 'L', 'XL');",callback);
  db.runSql("CREATE TYPE shirtmodel AS ENUM ('Normal fit', 'Slim fit');",callback);

  db.addColumn('participants', 'shirtsize', {type: 'shirtsize', notNull:'true', defaultValue: 'XS'}, callback);
  db.addColumn('participants', 'shirtmodel', {type: 'shirtmodel', notNull:'true', defaultValue: 'Normal fit'}, callback);
  db.addColumn('participants', 'shirtordered', {type: 'boolean', notNull:'true', defaultValue: 'false'}, callback);
};

exports.down = function(db, callback) {
  db.runSql("create table tshirts (id SERIAL PRIMARY KEY, size VARCHAR(255), model VARCHAR(255), participantId SERIAL references participants(id));", callback);

  db.removeColumn('participants', 'shirtsize', callback);
  db.removeColumn('participants', 'shirtmodel', callback);
  db.removeColumn('participants', 'shirtordered', callback);

  db.runSql("DROP TYPE shirtsize", callback);
  db.runSql("DROP TYPE shirtmodel", callback);
};
