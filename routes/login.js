var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function (req, res) {
    res.render('login', { error: req.flash('error') });
});

router.post('/',
    passport.authenticate('local',
        { successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true }
    )
);

module.exports = router;
