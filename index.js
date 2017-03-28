var config = require("./config");

var express = require("express");
var bodyParser = require("body-parser");

var mysql = require("mysql");
var connection = mysql.createConnection({
  host : config.host,
  user : config.user,
  password : config.password,
  database : 'managr'
});

var api = require("./api")(connection, config);

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use("/api", api);

app.listen(10201, function(err){
  if(err) console.log(err);
  console.log("Listening");
});
