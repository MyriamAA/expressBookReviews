const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
require("dotenv").config();
const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  // Extract token

  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "Not authenticated" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, obj) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized" });
    }
    req.user = obj;

    next();
  });
  //Write the authenication mechanism here
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
