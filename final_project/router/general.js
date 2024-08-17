const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const bcrypt = require("bcryptjs");
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please enter a username and a password" });
  }

  const exists = users.some((user) => user.username === username);

  if (exists) {
    return res.status(409).json({ message: "Please choose another username" });
  }

  try {
    const hashedPass = await bcrypt.hash(password, 10);
    users.push({ username: username, password: hashedPass });
    return res.status(201).json({ message: "User registered successfully" });
  } catch (e) {
    return res.status(500).json({ message: "Error registering user" });
  }
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/books.json");
    const books = response.data;
    return res.status(200).json(books);
  } catch (e) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  if (isNaN(isbn)) {
    return res.status(400).json({ message: "Invalid ISBN format" });
  }

  try {
    const response = await axios.get("http://localhost:5000/books.json");
    const books = response.data;
    const book = books[isbn];

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "No such book" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Error fetching book details" });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const { author } = req.params;

  if (!author) {
    return res.status(400).json({ message: "Enter author name" });
  }

  try {
    const response = await axios.get("http://localhost:5000/books.json");
    const books = response.data;
    const details = Object.values(books);
    const book = details.find((book) => book.author === author);

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "No such book" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Error fetching book details" });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const { title } = req.params;

  if (!title) {
    return res.status(400).json({ message: "Enter the title" });
  }

  try {
    const response = await axios.get("http://localhost:5000/books.json");
    const books = response.data;
    const details = Object.values(books);
    const book = details.find((book) => book.title === title);

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "No such book" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Error fetching book details" });
  }
});

//  Get book review
public_users.get("/review/:isbn", async (req, res) => {
  const { isbn } = req.params;

  if (isNaN(isbn)) {
    return res.status(400).json({ message: "Invalid ISBN format" });
  }

  try {
    const response = await axios.get("http://localhost:5000/books.json");
    const books = response.data;
    const book = books[isbn];

    if (book) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(404).json({ message: "No such book" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Error fetching book review" });
  }
});

module.exports.general = public_users;
