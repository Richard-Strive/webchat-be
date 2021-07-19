const express = require("express");

const route = express.Router();

route.get("/test", async (req, res, next) => {
  try {
    res.send("THE ROUTE IT'S WORKING");
  } catch (error) {
    console.log(error);
  }
});

module.exports = route;
