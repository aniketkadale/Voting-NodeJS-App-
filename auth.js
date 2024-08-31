const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./Models/User");

// Authentication using Passport.js
passport.use(
  new LocalStrategy(async (USERNAME, PASSWORD, done) => {
    try {
      const user = await User.findOne({ username: USERNAME });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const checkPassword = await user.comparePassword(PASSWORD);

      if (checkPassword) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password" });
      }
    } catch (err) {
      return done(err);
    }
  })
);

module.exports = passport;
