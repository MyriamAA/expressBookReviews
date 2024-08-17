const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
require("dotenv").config();
const path = require("path"); // Required for handling file paths

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "router")));

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("No Authorization header found");
    return res.status(403).send({ message: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, obj) => {
    if (err) {
      console.log("JWT verification failed:", err.message);
      return res.status(401).send({ message: "Not authorized" });
    }

    req.user = obj;
    console.log("JWT verification successful");

    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
