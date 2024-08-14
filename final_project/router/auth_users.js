const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
};

//only registered users can login
regd_users.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Enter both username and password" });
  }

  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(400).json({ message: "User doesn't exist" });
  }

  try {
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Wrong credentials" });
    } else {
      jwt.sign({ username, password }, process.env.JWT_SECRET, (err, token) => {
        if (err) {
          return res.status(500).json({ message: "Error generating token" });
        } else {
          return res.status(200).json({ token, message: "Login successful" });
        }
      });
    }
  } catch (e) {
    return res.status(500).json({ message: "Error logging in" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
