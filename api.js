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
    //connection.connect();
    connection.query('SELECT * FROM User WHERE email = \'' + req.body.email + '\';', function(err, results, fields){
      if(err){
        res.status(500).json({
          success : false,
          message : err
        });
      }else if(results == null || results.length < 1){
        res.status(500).json({
          success : false,
          message : "User not found"
        })
        return;
      }else if(results.length > 1){
        res.status(500).json({
          success : false,
          message : "Multiple entry error"
        });
      }else{
        if(results[0].password == req.body.password){
          if(results[0].type == 'teacher'){
            connection.query('SELECT *  FROM Teacher WHERE email = \'' + results[0].email + '\';', function(err, teacher){
              if(err){
                res.status(500).json({
                  success : false,
                  message : err
                });
              }else{
              results[0].teacher = teacher;
                res.status(200).json({
                  success : true,
                  message : "Success!",
                  user : results[0],
                  token : {
                    token : jwt.sign(results[0], secret, {expiresIn : expiry}),
                    expiry : expiry
                  }
                });
                //connection.end();
              }
            });
          }else if(results[0].type == 'student'){
            connection.query('SELECT *  FROM Student WHERE email = \'' + results[0].email + '\';', function(err, student){
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
                user : results[0],
                token : {
                  token : jwt.sign(results[0], secret, {expiresIn : expiry}),
                  expiry : expiry
                }
              });
              //connection.end();
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

  });

  api.get("/login", function(req, res){
    jwt.verify(req.query.token, secret, function(err, decoded){
      if(err){
        res.status(403).json({
          success : false,
          message : err
        });
      }else{
        res.status(200).json({
          success : true,
          message : "Success!",
          user : decoded
        });
      }
    });
  });

  api.get("/student-projects", function(req, res){
    jwt.verify(req.query.token, secret, function(err, decoded){
      if(err){
        res.status(403).json({
          success : false,
          message : err
        });
      }else{
        connection.query("SELECT p.* FROM works_on w, Project p WHERE w.s_email = \'" + decoded.email + "\' AND w.p_title = p.title;", function(dberr, projects){
          if(dberr){
            res.status(500).json({
              success : false,
              message : dberr
            });
          }else{
            for(project in projects){
              connection.query("SELECT * FROM Phase WHERE project = \'" + project.title +  "\';", function(phaseerr, phases){
                if(phaseerr){
                  res.status(500).json({
                    success : false,
                    message : phaseerr
                  });
                }else{
                  project.phases = phases;
                  for(phase in phases){
                    connection.query("SELECT * From Submission WHERE phase = \'" + phase.title + "\';", function(suberr, submissions){
                      if(suberr){
                        res.status(500).json({
                          success : false,
                          message : suberr
                        });
                      }else{
                        phase.submissions = submissions;
                      }
                    });
                  }
                }
              });
            }
            res.status(200).json({
              success : true,
              projects : projects
            });
          }
        });
      }
    });
  });

  return api;
};
