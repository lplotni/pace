/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Redis = require('ioredis');
const pdfRequests = require('./pdfRequests');
const express = require('express');
let apiRoute = require('./routes/api');

pdfRequests.setup(new Redis(6379, process.env.REDISHOST || 'localhost'));


let app = express();
app.use('/api', apiRoute);

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ', server.address().port);
});

