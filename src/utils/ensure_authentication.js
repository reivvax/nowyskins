const ensureAuthenticated = (req, res, next) => {
    if (req.user && req.isAuthenticated()&& req.user.email && req.user.tradelink) { return next(); }
    res.redirect('/?message=You must be authenticated to perform this action');
}

module.exports = ensureAuthenticated;