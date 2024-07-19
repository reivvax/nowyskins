const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user.email && req.user.tradelink) { return next(); }
    res.redirect('/');
}

module.exports = ensureAuthenticated;