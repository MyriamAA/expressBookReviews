const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const regd_users = express.Router();

let users = [];

// Utility functions to check if user exists
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = async (username, password) => {
  const user = users.find((u) => u.username === username);
  if (user) {
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return true;
    }
  }
  return false;
};

// User login route
regd_users.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(`username: ${username} \npass:${password}`);

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Enter both username and password" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "User doesn't exist" });
  }

  try {
    const isAuthenticated = await authenticatedUser(username, password);
    if (!isAuthenticated) {
      return res.status(401).json({ message: "Wrong credentials" });
    } else {
      jwt.sign(
        { username }, // Payload of the token
        process.env.JWT_SECRET, // Secret key
        { expiresIn: "1h" }, // Token expiration
        (err, token) => {
          if (err) {
            return res.status(500).json({ message: "Error generating token" });
          } else {
            return res.status(200).json({ token, message: "Login successful" });
          }
        }
      );
    }
  } catch (e) {
    console.error("Error during login:", e);
    return res.status(500).json({ message: "Error logging in" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const authHeader = req.headers["authorization"]; // Get the Authorization header

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token part (after 'Bearer')

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const username = decoded.username;
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review;

    return res
      .status(200)
      .json({ message: "Review added/updated", reviews: book.reviews });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
