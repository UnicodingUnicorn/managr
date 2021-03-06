DROP DATABASE IF EXISTS MANAGR;
CREATE DATABASE MANAGR;
USE MANAGR;

CREATE USER 'managr'@'localhost' IDENTIFIED BY 'password';
GRANT DELETE ON MANAGR.* TO 'managr'@'localhost';
GRANT INSERT ON MANAGR.* TO 'managr'@'localhost';
GRANT SELECT ON MANAGR.* TO 'managr'@'localhost';
GRANT UPDATE ON MANAGR.* TO 'managr'@'localhost';

CREATE TABLE User (
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  PRIMARY KEY (email)
);

CREATE TABLE Teacher (
  email VARCHAR(255) NOT NULL,
  p_hole INT,
  extension INT,
  PRIMARY KEY (email),
  FOREIGN KEY (email) REFERENCES User(email) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Student (
  email VARCHAR(255) NOT NULL,
  student_id CHAR(8),
  class CHAR(6),
  PRIMARY KEY (email),
  FOREIGN KEY (email) REFERENCES User(email) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Module (
  code VARCHAR(6) NOT NULL,
  name VARCHAR(255),
  description VARCHAR(255),
  PRIMARY KEY (code)
);

CREATE TABLE Class (
  name VARCHAR(255) NOT NULL,
  teacher_email VARCHAR(255) NOT NULL,
  module VARCHAR(6) NOT NULL,
  PRIMARY KEY (name),
  FOREIGN KEY (teacher_email) REFERENCES Teacher(email) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (MODULE) REFERENCES Module(code) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Project (
  title VARCHAR(255) NOT NULL,
  class VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  PRIMARY KEY (title),
  FOREIGN KEY (class) REFERENCES Class(name) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Phase (
  title VARCHAR(255) NOT NULL,
  description VARCHAR(1000),
  deadline DATETIME,
  project VARCHAR(255) NOT NULL,
  percentage FLOAT,
  PRIMARY KEY (title, project),
  FOREIGN KEY (project) REFERENCES Project(title) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Submission (
  id INT NOT NULL AUTO_INCREMENT,
  phase VARCHAR(255) NOT NULL,
  project VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  time DATETIME,
  comments VARCHAR(1000),
  grade VARCHAR(5),
  submitter VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (phase, project) REFERENCES Phase(title, project) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (submitter) REFERENCES Student(email) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE is_in (
  c_name VARCHAR(255) NOT NULL,
  s_email VARCHAR(255) NOT NULL,
  PRIMARY KEY (c_name, s_email),
  FOREIGN KEY (c_name) REFERENCES Class(name) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (s_email) REFERENCES Student(email) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE works_on (
  p_title VARCHAR(255) NOT NULL,
  s_email VARCHAR(255) NOT NULL,
  PRIMARY KEY (p_title, s_email),
  FOREIGN KEY (p_title) REFERENCES Project(title) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (s_email) REFERENCES Student(email) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE teaches (
  t_email VARCHAR(255) NOT NULL,
  module VARCHAR(6) NOT NULL,
  PRIMARY KEY (t_email, module),
  FOREIGN KEY (t_email) REFERENCES Teacher(email) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (module) REFERENCES Module(code) ON UPDATE CASCADE ON DELETE CASCADE
);
