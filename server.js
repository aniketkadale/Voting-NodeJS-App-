require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./db");
const passport = require("./auth");
// const { jwtAuthMiddleware } = require("./jwt");

app.use(bodyParser.json());
app.use(passport.initialize());

const PORT = process.env.PORT || 3000;

const userRoutes = require("./Routes/userRoutes");
const candidateRoutes = require("./Routes/candidateRoutes");
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
