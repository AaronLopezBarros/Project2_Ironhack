const isLoggedIn = (req, res, next) => {
    if (!req.session.loggedUser) {
      return res.redirect('/login');
    }
    next();
  };
   
const isLoggedOut = (req, res, next) => {
    if (req.session.loggedUser) {
      return res.redirect('/');
    }
    next();
  };
   
  module.exports = {
    isLoggedIn,
    isLoggedOut
  };