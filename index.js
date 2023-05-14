const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const mongodb = require("mongoose");
const cors = require("cors");
require("dotenv").config();
app.use(cors());
app.use(express.json());

mongodb
  .connect(
    "mongodb+srv://rasul8215:rasul8215@cluster0.aqrjrwk.mongodb.net/test",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("connected"))
  .catch(() => console.log("error"));

const user = require("./models/model");

app.post("/signup", (req, res) => {
  const newuser = new user({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 10),
  });
  newuser.save();
  res.json(newuser);
});
app.post("/login", async (req, res) => {
  try {
    const newuser = req.body;
    console.log(newuser);
    const data = await user.findOne({ username: newuser.username });
    if (!data) {
      return res.send("error");
    }
    const match = bcrypt.compareSync(newuser.password, data.password);
    console.log(data);
    if (match) {
      const token = jwt.sign(data.toJSON(), "hello");
      return res.json(token);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.json("signin first");
  }
  const token = auth.replace("Bearer", "").trim();
  jwt.verify(token, "hello", (err, user) => {
    if (err) {
      res.status(401);
    }
    req.data = { ...user, username: user._id };
    next();
  });
});

app.get("/get", (req, res) => {
  try {
    res.send(req.data);
  } catch (err) {
    res.send(err.message || err);
  }
});

app.listen(process.env.PORT ?? 3000);
