var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function (req, res) {
    res.render('login', {});
});

router.post('/',
    passport.authenticate('local',
        { successRedirect: '/admin',
        failureRedirect: '/login'}
    )
);

module.exports = router;
