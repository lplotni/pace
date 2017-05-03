/* jshint node: true */
/* jshint esnext: true */
'use strict';

const Redis = require('ioredis');
const pdfRequests = require('./pdfRequests');

pdfRequests.setup(new Redis(6379, process.env.REDISHOST || 'localhost'));
