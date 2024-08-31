const express = require("express");
const router = express.Router();
const User = require("./../Models/User");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

router.post("/signup", async (req, res) => {
  const data = req.body;
  const newUser = new User(data);

  try {
    const response = await newUser.save();
    const payload = {
      id: response.id,
    };

    const token = generateToken(payload);
    // console.log(token);
    console.log("User created...");
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Intern error while creating a user..." });
  }
});

// Login user with jwt token
router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: "Invalid aadhar no or password" });
    }

    const payload = {
      id: user.id,
    };

    const token = generateToken(payload);
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error whilte logging in" });
  }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    // console.log(userData);
    const userid = userData.id;
    const user = await User.findById(userid);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Internal server error while fetching profle..." });
  }
});

// update user password
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid password" });
    }

    user.password = newPassword;
    await user.save();

    console.log("Password updated...");
    res.status(200).json({ message: "Password updated..." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal server error while updating password..." });
  }
});

module.exports = router;
