var cryptico = require("cryptico");

var editUrlGenerator = function () {

    var constantUrlPart = 'edit_participant/?edit=';
    var passPhrase = "Lauf gegen rechts!!";
    var key = cryptico.generateRSAKey(passPhrase, 512);
    var publicKeyString = cryptico.publicKeyString(key);

    var encrypt = function (value) {
        return cryptico.encrypt(value, publicKeyString).cipher;
    };

    var decrypt = function (encrypted) {
        return cryptico.decrypt(encrypted, key).plaintext;
    };

    var generateUrl = function (value) {
        var encrypted = encrypt(value);
        return constantUrlPart + encodeURIComponent(encrypted);
    };

    var getIdFromEncryptedUrl = function (url) {
        var encryptedPart = url.replace(constantUrlPart, '');
        return decrypt(encryptedPart);
    };

    return {
        generateEncryptedUrl: generateUrl,
        getIdFromEncryptedUrl: getIdFromEncryptedUrl
    }
}();

module.exports = editUrlGenerator;