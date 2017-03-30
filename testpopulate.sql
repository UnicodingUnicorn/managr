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
  email, student_id, class
) VALUES (
  "student@school.com", "h1310001", "M17502"
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
--Insert test Projects and Stuff
INSERT INTO Project (
  title, class, description
) VALUES (
  "TT5101 Project 1", "502", "Test Project Number 1"
);
INSERT INTO Phase (
  title, description, deadline, project, percentage
) VALUES (
  "Phase 1", "Phase 1 of the stuff", "20170601 11:59:59 PM", "TT5101 Project 1", 50.0
);
INSERT INTO Phase (
  title, description, deadline, project, percentage
) VALUES (
  "Phase 2", "Phase 2 of the stuff", "20170603 11:59:59 PM", "TT5101 Project 1", 50.0
);
INSERT INTO works_on (
  p_title, s_email
) VALUES (
  "TT5101 Project 1", "student@school.com"
);
INSERT INTO Project (
  title, class, description
) VALUES (
  "TT5101 Project 2", "502", "Test Project Number 2"
);
INSERT INTO Phase (
  title, description, deadline, project, percentage
) VALUES (
  "Phase 1", "Phase 1 of the stuff", "20170601 11:59:59 PM", "TT5101 Project 2", 50.0
);
INSERT INTO Phase (
  title, description, deadline, project, percentage
) VALUES (
  "Phase 2", "Phase 2 of the stuff", "20170603 11:59:59 PM", "TT5101 Project 2", 50.0
);
INSERT INTO works_on (
  p_title, s_email
) VALUES (
  "TT5101 Project 2", "student@school.com"
);
