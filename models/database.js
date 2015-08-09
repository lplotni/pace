var pg = require('pg');
var client = new pg.Client("tcp://vagrant@localhost/vagrant");
client.connect(
    function (err) { 
        if (!err) {
            return client.query (
                "create table participants (id SERIAL PRIMARY KEY, email VARCHAR(255), first_name VARCHAR(255), last_name VARCHAR(255));",
                function (err, res) { 
                    if (! err) { 
                        console.log("result:" , res);
                        client.end();
                        return "created";
                    }
                }
            );
        }
    }
);