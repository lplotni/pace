/* jshint node: true */
/* jshint esnext: true */
'use strict';
const crypto = require("crypto");

const editUrlHelper = function () {
  const constantUrlPart = 'editparticipant/?edit=';

  var generateUrl = function (value) {
    return constantUrlPart + encodeURIComponent(value);
  };

  var generateSecureID = function () {
    return crypto.randomBytes(32).toString('hex');
  };

  var getIdFromUrl = function (url) {
    var encryptedPart = url.replace(constantUrlPart, '');
    return encryptedPart;
  };

  return {
    generateUrl: generateUrl,
    getIdFromUrl: getIdFromUrl,
    generateSecureID: generateSecureID
  };
}();

module.exports = editUrlHelper;
