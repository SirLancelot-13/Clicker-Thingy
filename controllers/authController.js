const passport = require('../passport.config.js')

exports.AuthenticateUser = passport.authenticate('google', { scope: ['profile', 'email'] });
//check out where ts goes wrong
exports.otherThingy = passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login'
});