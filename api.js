module.exports = function(connection, config){
  var express = require("express");
  var bodyParser = require("body-parser");

  var shortid = require("shortid");
  var fecha = require("fecha");
  var jwt = require("jsonwebtoken");
  var secret = config.secret;
  var expiry = config.expiry;

  var async = require("async");

  var api = express.Router();
  api.use(bodyParser.json());
  api.use(bodyParser.urlencoded({extended : true}));

  api.get("/", function(req, res){
    res.send("Received");
  });

  api.post("/login", function(req, res){
    //connection.connect();
    connection.query('SELECT * FROM User WHERE email = ?;', req.body.email, function(err, results, fields){
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
            connection.query('SELECT *  FROM Teacher WHERE email = ?;', results[0].email, function(err, teacher){
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
            connection.query('SELECT *  FROM Student WHERE email = ?;', results[0].email, function(err, student){
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

  api.get("/student-token-projects", function(req, res){
    jwt.verify(req.query.token, secret, function(err, decoded){
      if(err){
        res.status(403).json({
          success : false,
          message : err
        });
      }else{
        connection.query("SELECT p.* FROM works_on w, Project p WHERE w.s_email = ? AND w.p_title = p.title;", decoded.email, function(dberr, projects){
          if(dberr){
            res.status(500).json({
              success : false,
              message : dberr
            });
          }else{
            async.each(projects, function(project, project_cb){
              connection.query("SELECT * FROM Phase WHERE project = ?;", project.title, function(phaseerr, phases){
                if(phaseerr){
                  res.status(500).json({
                    success : false,
                    message : phaseerr
                  });
                }else{
                  project.phases = phases;
                  async.each(phases, function(phase, phase_cb){
                    connection.query("SELECT * From Submission WHERE phase = ? AND project = ? AND submitter = ?;", [phase.title, phase.project, decoded.email], function(suberr, submissions){
                      if(suberr){
                        res.status(500).json({
                          success : false,
                          message : suberr
                        });
                      }else{
                        phase.submissions = submissions;
                        phase_cb();
                      }
                    });
                  }, function(err){
                    if(err) project_cb(err);
                    project_cb(null);
                  });
                }
              });
            }, function(err){
              res.status(200).json({
                success : true,
                projects : projects
              });
            });
          }
        });
      }
    });
  });

  /*api.get("/student-projects", function(req, res){
    connection.query("SELECT p.* FROM Project p, works_on w WHERE p.title = ")
  });*/

  api.post("/new-submission", function(req, res){
    jwt.verify(req.body.token, secret, function(err, decoded){
      if(err){
        res.status(403).json({
          success : false,
          message : err
        });
      }else{
        connection.query("INSERT INTO Submission (phase, project, link, time, submitter) VALUES (?, ?, ?, ?, ?);", [req.body.phase, req.body.project, req.body.link, fecha.format(Date.now(), 'YYYY-MM-DD HH:mm:ss'), decoded.email], function(err, submission){
          if(err){
            console.log(err);
            res.status(500).json({
              success : false,
              message : err
            });
          }else{
            res.status(200).json({
              success : true,
              message : err
            });
          }
        });
      }
    });
  });

  api.get("/teacher-token-classes", function(req, res){
    jwt.verify(req.query.token, secret, function(err, decoded){
      if(err){
        res.status(400).json({
          success : false,
          message : err
        });
      }else{
        connection.query("SELECT * FROM Class WHERE teacher_email = ?;", decoded.email, function(err, classes){
          if(err){
            res.status(500).json({
              success : false,
              message : err
            });
          }else{
            async.each(classes, function(class_, class_cb){
              connection.query("SELECT * FROM Module WHERE code = ?;", class_.module, function(err, module){
                  if(err){
                    class_cb(err);
                  }else{
                    class_.module = module[0];
                    class_cb(null);
                  }
              });
            }, function(err){
              async.each(classes, function(class_, class_cb){
                connection.query("SELECT * FROM Student NATURAL JOIN User WHERE email = (SELECT s_email FROM is_in WHERE c_name = ?);", class_.name, function(err, students){
                  if(err){
                    console.log(err);
                    class_cb(err);
                  }else{
                    class_.students = students;
                    class_cb(null);
                  }
                });
              }, function(err){
                async.each(classes, function(class_, class_cb){
                  async.each(class_.students, function(student, student_cb){
                    connection.query("SELECT p.* FROM Project p, works_on w WHERE p.title = w.p_title AND w.s_email = ?;", student.email, function(err, projects){
                      if(err) {
                        student_cb(err);
                      }else{
                        student.projects = projects;
                        async.each(student.projects, function(project, project_cb){
                          connection.query("SELECT * FROM Phase WHERE project = ?;", project.title, function(err, phases){
                            if(err){
                              project_cb(err);
                            }else{
                              project.phases = phases;
                              async.each(project.phases, function(phase, phase_cb){
                                connection.query("SELECT * FROM Submission WHERE phase = ? AND project = ? AND submitter = ?;", [phase.title, project.title, student.email], function(err, submissions){
                                  if(err){
                                     phase_cb(err);
                                  }else{
                                    phase.submissions = submissions;
                                    phase_cb(null);
                                  }
                                });
                              }, function(err){
                                project_cb(err);
                              });
                            }
                          });
                        }, function(err){
                          student_cb(err);
                        });
                      }
                    });
                  }, function(err){
                    class_cb(err);
                  });
                }, function(err){
                  if(err){
                    console.log(err);
                    res.status(500).json({
                      success : false,
                      message : err
                    });
                  }else{
                    res.status(200).json({
                      success : true,
                      classes : classes
                    });
                  }
                });

              });
            });
          }
        });
      }
    });
  });

  api.post("/grade-submission", function(req, res){
    console.log(req.body);
    jwt.verify(req.body.token, secret, function(err, decoded){
      if(err){
        res.status(403).json({
          success : false,
          message : "Not authenticated"
        });
      }else{
        connection.query("UPDATE Submission SET comments = ?, grade = ? WHERE id = ?;", [req.body.comment, req.body.grade, parseInt(req.body.submission)], function(err, results){
          if(err){
            console.log(err);
            res.status(500).json({
              success : false,
              message : err
            });
          }else{
            res.status(200).json({
              success : true,
              message : results
            });
          }
        });
      }
    });
  });

  return api;
};
