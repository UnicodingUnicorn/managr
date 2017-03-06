var express = require("express");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var mysql = require("mysql");

var app = express();
var api = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use("/api", api);

api.post("/login", function(req, res){

});

app.listen(8080, function(){
  console.log("Listening");
});
