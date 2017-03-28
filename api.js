module.exports = function(connection, config){
  var express = require("express");
  var bodyParser = require("body-parser");

  var jwt = require("jsonwebtoken");
  var secret = config.secret;
  var expiry = config.expiry;

  var api = express.Router();
  api.use(bodyParser.json());
  api.use(bodyParser.urlencoded({extended : true}));

  api.get("/", function(req, res){
    res.send("Received");
  });

  api.post("/login", function(req, res){
    connection.connect();
    connection.query('SELECT * FROM User WHERE email = ' + req.body.email + ' AND password = ' + req.body.password, function(err, results, fields){
      if(err){
        res.status(500).json({
          success : false,
          message : "Internal database error"
        });
      }
      if(results.length > 1){
        res.status(500).json({
          success : false,
          message : "Multiple entry error"
        });
      }else{
        if(results[0].password == req.body.password){
          if(results[0].type = 'teacher'){
            connection.query('SELECT *  FROM Teacher WHERE email = ' + results[0].email, function(err, teacher){
              if(err){
                res.status(500).json({
                  success : false,
                  message : "Internal database error"
                });
              }
              results[0].teacher = teacher;
              res.status(200).json({
                success : true,
                message : "Success!",
                teacher : results[0],
                token : {
                  token : jwt.sign(results[0], secret, {expiresIn : expiry}),
                  expiry : expiry
                }
              })
            });
          }else if(results[0].type = 'student'){
            connection.query('SELECT *  FROM Student WHERE email = ' + results[0].email, function(err, student){
              if(err){
                res.status(500).json({
                  success : false,
                  message : "Internal database error"
                });
              }
              results[0].student = student;
              res.status(200).json({
                success : true,
                message : "Success!",
                student : results[0],
                token : {
                  token : jwt.sign(results[0], secret, {expiresIn : expiry}),
                  expiry : expiry
                }
              })
            });
          }else{
            res.status(500).json({
              success : false,
              message : "Unknown type!"
            });
          }
        }else{
          res.status(400).json({
            success : false,
            message : "Invalid password"
          })
        }
      }
    });
    connection.end();
  });

  api.get("/login", function(req, res){
    jwt.verify(req.params.token, secret, function(err, decoded){
      if(err){
        res.status(403).json({
          success : false,
          message : "Invalid token"
        });
      }
      connection.connect();
      connection.query(('SELECT * FROM User WHERE email = ' +  req.body.email + ' AND password = ' + req.body.password), function(err, results, fields){
        if(err){
          res.status(500).json({
            success : false,
            message : "Internal database error"
          });
        }
        if(results.length > 1){
          res.status(500).json({
            success : false,
            message : "Multiple entry error"
          });
        }else{
          if(results[0].type = 'teacher'){
            connection.query('SELECT *  FROM Teacher WHERE email = ' + results[0].email, function(err, teacher){
              if(err){
                res.status(500).json({
                  success : false,
                  message : "Internal database error"
                });
              }
              results[0].teacher = teacher;
              res.status(200).json({
                success : true,
                message : "Success!",
                teacher : results[0]
              })
            });
          }else if(results[0].type = 'student'){
            connection.query('SELECT *  FROM Student WHERE email = ' + results[0].email, function(err, student){
              if(err){
                res.status(500).json({
                  success : false,
                  message : "Internal database error"
                });
              }
              results[0].student = student;
              res.status(200).json({
                success : true,
                message : "Success!",
                student : results[0]
              })
            });
          }else{
            res.status(500).json({
              success : false,
              message : "Unknown type!"
            });
          }
        }
      });
      connection.end();
    });
  });

  return api;
};
