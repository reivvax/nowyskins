var express = require('express');
var router = express.Router();

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
  }

router.get('/', (req, res) => {
    console.log(req.isAuthenticated());
    console.log(req.user);
    res.render('index', { user: req.user });
});

router.get('/profile', ensureAuthenticated, function(req, res){
    res.render('profile', { user: req.user });
});

module.exports = router;