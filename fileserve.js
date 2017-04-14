var config = require("./config")

var express = require("express");
var shortid = require("shortid");
var multer = require("multer");
var storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, config.dest);
  },
  filename : function(req, file, cb){
    cb(null, file.originalname.replace(" ", "-"));
  }
});
var upload = multer({
  storage : storage
});
//var upload = multer({dest : config.dest});

var fileserve = express.Router();

fileserve.get("/", function(req, res){
  res.status(200).json({
    success : true,
    message : "Fileserve received"
  });
});

fileserve.get("/:filename", function(req, res){
  res.status(200).sendFile(__dirname + "/" + config.dest + req.params.filename);
});

fileserve.post("/upload", upload.single('submitted'), function(req, res){
  res.status(200).json({
    success : true,
    message : req.file.filename
  });
});

module.exports = fileserve;
