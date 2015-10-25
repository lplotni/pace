var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('admin', { title: 'Pace Admin-Bereich' });
});

module.exports = router;
