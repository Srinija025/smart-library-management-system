-- ==========================================
-- SMART LIBRARY MANAGEMENT SYSTEM
-- DAY 5: BOOK ISSUE AND RETURN
-- ==========================================

USE smart_library;


-- ==========================================
-- CREATE BORROWINGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS borrowings (

    borrowing_id INT AUTO_INCREMENT PRIMARY KEY,

    student_id INT NOT NULL,

    book_id INT NOT NULL,

    issue_date DATE NOT NULL,

    due_date DATE NOT NULL,

    return_date DATE DEFAULT NULL,

    status ENUM('Issued', 'Returned')
        DEFAULT 'Issued',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id)
        REFERENCES students(student_id),

    FOREIGN KEY (book_id)
        REFERENCES books(book_id)

) ENGINE=InnoDB;


-- ==========================================
-- DISPLAY TABLE STRUCTURE
-- ==========================================

DESCRIBE borrowings;


-- ==========================================
-- DISPLAY BORROWING RECORDS
-- ==========================================

SELECT * FROM borrowings;