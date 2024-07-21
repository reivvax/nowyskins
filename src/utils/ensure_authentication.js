const ensureAuthenticated = (req, res, next) => {
    if (req.user && req.isAuthenticated()&& req.user.email && req.user.tradelink) { return next(); }
    res.status(401).redirect('/');
}

module.exports = ensureAuthenticated;