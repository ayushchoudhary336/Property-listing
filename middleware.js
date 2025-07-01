module.exports.isloggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "you must be logged in to make any changes ");
    return res.redirect("/login");
  }
  next();
};
