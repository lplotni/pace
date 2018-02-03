/* jshint node: true */
/* jshint esnext: true */
'use strict';
const fs = require('fs');
const sha = JSON.parse(fs.readFileSync('version.sha','utf8'));

module.exports = sha;
