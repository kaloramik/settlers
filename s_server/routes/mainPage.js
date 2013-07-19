
exports.mainPage = function(req, res) {
  res.render("home.jade", { title: "this is a title", sessionID: req.sessionID});
};
