var pg = require('pg');
var connectionString = process.env.SNAP_DB_PG_URL || process.env.DATABASE_URL || 'tcp://vagrant@localhost/pace';
pg.connect(connectionString, function (err, client, done) {
        if (!err) {
            client.query (
                "create table participants (id SERIAL PRIMARY KEY, email VARCHAR(255), firstname VARCHAR(255), lastname VARCHAR(255));");
            done();
        }
    }
);