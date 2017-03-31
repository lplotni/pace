/* jshint node: true */
/* jshint esnext: true */
'use strict';

let pdfRequests = {};

pdfRequests.setup = (redis) => {
  redis.subscribe('pace-pdf', (err, count) => {
  });
  redis.on('message', pdfRequests.parse);
};

pdfRequests.parse = (message) => {
 return JSON.parse(message);
};

//redis.subscribe('pdf', 'info', (err, count) => {});


module.exports = pdfRequests;

