var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function (db, callback) {
  db.runSql("alter table tshirts drop constraint tshirts_participantid_fkey;", add_new_constraint);

  function add_new_constraint(err) {
      if (err) { callback(err); return; }
      db.runSql("alter table tshirts add constraint tshirts_participantid_fkey FOREIGN KEY (participantid) REFERENCES participants(id) ON DELETE CASCADE;", callback);
  }
};

exports.down = function (db, callback) {
  db.runSql("alter table tshirts drop constraint tshirts_participantid_fkey;", add_old_constraint);
  function add_old_constraint(err) {
      if (err) { callback(err); return; }
      db.runSql("alter table tshirts add constraint tshirts_participantid_fkey FOREIGN KEY (participantid) REFERENCES participants(id);", callback);
  }

};
