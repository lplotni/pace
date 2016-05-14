/* jshint node: true */
/* jshint esnext: true */
'use strict';
const crypto = require('crypto');
const config = require('config');

const editUrlHelper = () => {

  return {
    generateUrl: (value) => {
      return `${config.get('pace-url')}/editparticipant/` + encodeURIComponent(value);
    },
    generateUrlForAdmin: (value) => {
      return `${config.get('pace-url')}/admin/editparticipant/` + encodeURIComponent(value);
    },
    generateSecureID: () => {
      return crypto.randomBytes(32).toString('hex');
    }
  };
}();

module.exports = editUrlHelper;
