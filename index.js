var config = require("./config");

var express = require("express");
var bodyParser = require("body-parser");

var mysql = require("mysql");
var connection = mysql.createConnection({
  host : config.host,
  user : config.user,
  password : config.password,
  database : 'MANAGR'
});
connection.connect();

var api = require("./api")(connection, config);

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use("/api", api);
app.use(express.static(__dirname + "/frontend"));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/frontend/index.html");
});

app.listen(10201, function(err){
  if(err) console.log(err);
  console.log("Listening");
});
