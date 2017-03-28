USE MANAGR;

--Insert test Teacher
INSERT INTO User (
  email, name, password, type
) VALUES (
  "teacher@school.com", "Teacher", "password", "teacher"
);
INSERT INTO Teacher (
  email, p_hole, extension
) VALUES (
  "teacher@school.com", 123, 65973
);
--Insert test Student
INSERT INTO User (
  email, name, password, type
) VALUES (
  "student@school.com", "Student", "password", "student"
);
INSERT INTO Student (
  student_id, class
) VALUES (
  h1310001, M17502
);
--Insert test Module
INSERT INTO Module (
  code, name, description
) VALUES (
  "TT5101", "Test Module", "A module for testing"
);
--Insert test Class
INSERT INTO Class (
  name, teacher_email, module
) VALUES (
  "502", "teacher@school.com", "TT5101"
);
--Insert test Project
