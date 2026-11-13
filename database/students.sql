-- =====================================
-- SMART LIBRARY MANAGEMENT SYSTEM
-- DAY 4: STUDENT MANAGEMENT
-- =====================================

-- Select existing database

USE smart_library;


-- =====================================
-- CREATE STUDENTS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS students (

    student_id INT AUTO_INCREMENT PRIMARY KEY,

    student_name VARCHAR(150) NOT NULL,

    roll_number VARCHAR(30) NOT NULL UNIQUE,

    email VARCHAR(150) NOT NULL UNIQUE,

    phone VARCHAR(20),

    department VARCHAR(100) NOT NULL,

    academic_year VARCHAR(20) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);


-- =====================================
-- DISPLAY STUDENTS TABLE
-- =====================================

DESCRIBE students;


-- =====================================
-- DISPLAY ALL STUDENTS
-- =====================================

SELECT * FROM students;