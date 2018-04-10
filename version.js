/* jshint node: true */
/* jshint esnext: true */
'use strict';
const fs = require('fs');
const version = JSON.parse(fs.readFileSync('version.sha','utf8'));

module.exports = {sha: version.sha.substring(0,7)};
