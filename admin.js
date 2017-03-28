module.exports = function(connection, config){
  var express = require("express");
  var bodyParser = require("body-parser");

  var admin = express.Router();

  admin.get("/user", function(req, res){

  });

  admin.get("/users", function(req, res){

  });

  admin.post("/adduser", function(req, res){
    
  })

  return admin;
};
