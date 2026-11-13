
const express = require("express");
const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.use(verifyToken, requireRole("student"));


// GET STUDENT PROFILE

router.get("/me", async (req, res) => {

    try {

        const [rows] = await db.execute(

            `SELECT
                student_id,
                student_name,
                roll_number,
                email,
                department,
                academic_year
             FROM students
             WHERE student_id = ?`,

            [req.user.student_id]

        );

        if (!rows.length) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(rows[0]);

    } catch (error) {

        res.status(500).json({
            message: "Unable to load profile"
        });

    }

});


// GET CURRENTLY ISSUED BOOKS

router.get("/issued", async (req, res) => {

    try {

        const [rows] = await db.execute(

            `SELECT
                br.borrowing_id,
                b.title,
                b.author,
                c.category_name,
                DATE_FORMAT(br.issue_date, '%Y-%m-%d') AS issue_date,
                DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
                DATEDIFF(br.due_date, CURRENT_DATE()) AS days_remaining,
                CASE
                    WHEN br.due_date < CURRENT_DATE()
                    THEN 'Overdue'
                    WHEN br.due_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY)
                    THEN 'Due Soon'
                    ELSE 'Issued'
                END AS display_status

             FROM borrowings br

             JOIN books b
                ON br.book_id = b.book_id

             JOIN categories c
                ON b.category_id = c.category_id

             WHERE br.student_id = ?
             AND br.status = 'Issued'

             ORDER BY br.due_date ASC`,

            [req.user.student_id]

        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load issued books"
        });

    }

});


// GET COMPLETE BORROWING HISTORY

router.get("/history", async (req, res) => {

    try {

        const [rows] = await db.execute(

            `SELECT
                br.borrowing_id,
                b.title,
                b.author,
                DATE_FORMAT(br.issue_date, '%Y-%m-%d') AS issue_date,
                DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
                DATE_FORMAT(br.return_date, '%Y-%m-%d') AS return_date,
                br.status,
                CASE
                    WHEN br.status = 'Issued'
                         AND br.due_date < CURRENT_DATE()
                    THEN 'Overdue'
                    ELSE br.status
                END AS display_status

             FROM borrowings br

             JOIN books b
                ON br.book_id = b.book_id

             WHERE br.student_id = ?

             ORDER BY br.borrowing_id DESC`,

            [req.user.student_id]

        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load borrowing history"
        });

    }

});


// STUDENT DASHBOARD STATISTICS

router.get("/summary", async (req, res) => {

    try {

        const [rows] = await db.execute(

            `SELECT

                COUNT(
                    CASE WHEN status = 'Issued'
                    THEN 1 END
                ) AS currently_issued,

                COUNT(
                    CASE WHEN status = 'Returned'
                    THEN 1 END
                ) AS returned_books,

                COUNT(
                    CASE WHEN status = 'Issued'
                    AND due_date < CURRENT_DATE()
                    THEN 1 END
                ) AS overdue_books,

                COUNT(
                    CASE WHEN status = 'Issued'
                    AND due_date >= CURRENT_DATE()
                    AND due_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY)
                    THEN 1 END
                ) AS due_soon

             FROM borrowings

             WHERE student_id = ?`,

            [req.user.student_id]

        );

        res.json(rows[0]);

    } catch (error) {

        res.status(500).json({
            message: "Unable to load dashboard statistics"
        });

    }

});


// STUDENT OVERDUE NOTIFICATIONS

router.get("/notifications", async (req, res) => {

    try {

        const [rows] = await db.execute(

            `SELECT
                br.borrowing_id,
                b.title,
                DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
                DATEDIFF(CURRENT_DATE(), br.due_date) AS overdue_days,
                CASE
                    WHEN br.due_date < CURRENT_DATE()
                    THEN 'Overdue'
                    ELSE 'Due Soon'
                END AS notification_type

             FROM borrowings br

             JOIN books b
                ON br.book_id = b.book_id

             WHERE br.student_id = ?
             AND br.status = 'Issued'
             AND br.due_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY)

             ORDER BY br.due_date ASC`,

            [req.user.student_id]

        );

        res.json(rows);

    } catch (error) {

        res.status(500).json({
            message: "Unable to load notifications"
        });

    }

});


// ==========================================
// STUDENT BOOK REQUESTS
// ==========================================

// GET ALL BOOK REQUESTS OF LOGGED-IN STUDENT

router.get("/requests", async (req, res) => {

    try {

        const [rows] = await db.execute(

            `SELECT
                br.request_id,
                br.book_id,
                b.title,
                b.author,
                br.request_date,
                br.status,
                br.admin_remarks

             FROM book_requests br

             JOIN books b
                ON br.book_id = b.book_id

             WHERE br.student_id = ?

             ORDER BY br.request_id DESC`,

            [req.user.student_id]

        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load book requests"
        });

    }

});


// STUDENT REQUESTS A BOOK

router.post("/requests", async (req, res) => {

    try {

        const student_id = req.user.student_id;
        const book_id = Number(req.body.book_id);

        if (!Number.isInteger(book_id) || book_id <= 0) {

            return res.status(400).json({
                message: "Please select a valid book"
            });

        }

        // CHECK WHETHER BOOK EXISTS AND IS AVAILABLE

        const [books] = await db.execute(

            `SELECT book_id, title, available_quantity
             FROM books
             WHERE book_id = ?`,

            [book_id]

        );

        if (!books.length) {

            return res.status(404).json({
                message: "Book not found"
            });

        }

        if (books[0].available_quantity <= 0) {

            return res.status(400).json({
                message: "This book is currently unavailable"
            });

        }

        // CHECK EXISTING PENDING OR APPROVED REQUEST

        const [existingRequests] = await db.execute(

            `SELECT request_id
             FROM book_requests
             WHERE student_id = ?
             AND book_id = ?
             AND status IN ('Pending', 'Approved')
             LIMIT 1`,

            [student_id, book_id]

        );

        if (existingRequests.length) {

            return res.status(409).json({
                message: "You already have an active request for this book"
            });

        }

        // CHECK WHETHER STUDENT ALREADY HAS THIS BOOK

        const [activeBorrowings] = await db.execute(

            `SELECT borrowing_id
             FROM borrowings
             WHERE student_id = ?
             AND book_id = ?
             AND status = 'Issued'
             LIMIT 1`,

            [student_id, book_id]

        );

        if (activeBorrowings.length) {

            return res.status(409).json({
                message: "You have already borrowed this book"
            });

        }

        // SAVE BOOK REQUEST

        const [result] = await db.execute(

            `INSERT INTO book_requests
                (student_id, book_id, status)
             VALUES (?, ?, 'Pending')`,

            [student_id, book_id]

        );

        res.status(201).json({

            message: "Book request submitted successfully",

            request_id: result.insertId,

            status: "Pending"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to submit book request"
        });

    }

});


// ==========================================
// STUDENT RETURN REQUESTS
// ==========================================

// GET ALL RETURN REQUESTS OF LOGGED-IN STUDENT

router.get("/return-requests", async (req, res) => {

    try {

        const [rows] = await db.execute(

            `SELECT
                rr.return_request_id,
                rr.borrowing_id,
                b.title,
                rr.request_date,
                rr.status

             FROM return_requests rr

             JOIN borrowings br
                ON rr.borrowing_id = br.borrowing_id

             JOIN books b
                ON br.book_id = b.book_id

             WHERE rr.student_id = ?

             ORDER BY rr.return_request_id DESC`,

            [req.user.student_id]

        );

        res.json(rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load return requests"
        });

    }

});


// STUDENT REQUESTS TO RETURN AN ISSUED BOOK

router.post("/returns", async (req, res) => {

    try {

        const student_id = req.user.student_id;
        const borrowing_id = Number(req.body.borrowing_id);

        if (!Number.isInteger(borrowing_id) || borrowing_id <= 0) {

            return res.status(400).json({
                message: "Please select a valid borrowing record"
            });

        }

        // CHECK WHETHER THIS BOOK BELONGS TO THE LOGGED-IN STUDENT

        const [borrowings] = await db.execute(

            `SELECT borrowing_id
             FROM borrowings
             WHERE borrowing_id = ?
             AND student_id = ?
             AND status = 'Issued'`,

            [borrowing_id, student_id]

        );

        if (!borrowings.length) {

            return res.status(404).json({
                message: "Issued book not found"
            });

        }

        // CHECK FOR AN EXISTING PENDING RETURN REQUEST

        const [existingRequests] = await db.execute(

            `SELECT return_request_id
             FROM return_requests
             WHERE borrowing_id = ?
             AND student_id = ?
             AND status = 'Pending'
             LIMIT 1`,

            [borrowing_id, student_id]

        );

        if (existingRequests.length) {

            return res.status(409).json({
                message: "A return request is already pending"
            });

        }

        // SAVE RETURN REQUEST

        const [result] = await db.execute(

            `INSERT INTO return_requests
                (borrowing_id, student_id, status)
             VALUES (?, ?, 'Pending')`,

            [borrowing_id, student_id]

        );

        res.status(201).json({

            message: "Return request submitted successfully",

            return_request_id: result.insertId,

            status: "Pending"

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to submit return request"
        });

    }

});


module.exports = router;




