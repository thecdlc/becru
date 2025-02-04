function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/admin');
}

module.exports = isAuthenticated;