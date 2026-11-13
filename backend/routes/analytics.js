const express = require("express");

const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

// ==========================================
// 1. DASHBOARD STATISTICS
// ==========================================

router.get("/summary", async (req, res) => {

    try {

        const [bookStats] = await db.execute(`

            SELECT

                COUNT(*) AS total_titles,

                COALESCE(
                    SUM(total_quantity), 0
                ) AS total_books,

                COALESCE(
                    SUM(available_quantity), 0
                ) AS available_books

            FROM books

        `);


        const [studentStats] = await db.execute(`

            SELECT COUNT(*) AS total_students

            FROM students

        `);


        const [borrowingStats] = await db.execute(`

            SELECT

                COUNT(*) AS total_transactions,

                COALESCE(
                    SUM(status = 'Issued'), 0
                ) AS issued_books,

                COALESCE(
                    SUM(status = 'Returned'), 0
                ) AS returned_books,

                COALESCE(
                    SUM(
                        status = 'Issued'
                        AND due_date < CURRENT_DATE()
                    ), 0
                ) AS overdue_books

            FROM borrowings

        `);


        res.json({

            books: bookStats[0],

            students: studentStats[0],

            borrowings: borrowingStats[0]

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Unable to load dashboard statistics"

        });

    }

});


// MONTHLY BORROWING ANALYTICS
router.get("/monthly", async (req, res) => {
    try {
        const [records] = await db.execute(`
            SELECT
                DATE_FORMAT(issue_date, '%Y-%m') AS month,
                COUNT(*) AS total_borrowings
            FROM borrowings
            WHERE issue_date >= DATE_SUB(
                CURDATE(),
                INTERVAL 11 MONTH
            )
            GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
            ORDER BY month ASC
        `);

        res.json(records);

    } catch (error) {
        console.error("Monthly analytics error:", error);
        res.status(500).json({
            message: "Unable to load monthly analytics"
        });
    }
});


// ==========================================
// 3. MOST BORROWED BOOKS
// ==========================================

router.get("/popular-books", async (req, res) => {

    try {

        const [records] = await db.execute(`

            SELECT

                b.book_id,

                b.title,

                COUNT(br.borrowing_id) AS borrow_count

            FROM books b

            LEFT JOIN borrowings br

                ON b.book_id = br.book_id

            GROUP BY

                b.book_id,

                b.title

            ORDER BY borrow_count DESC

            LIMIT 5

        `);


        res.json(records);


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Unable to load popular books"

        });

    }

});


// ==========================================
// 4. DEPARTMENT-WISE STUDENTS
// ==========================================

router.get("/departments", async (req, res) => {

    try {

        const [records] = await db.execute(`

            SELECT

                department,

                COUNT(*) AS total_students

            FROM students

            GROUP BY department

            ORDER BY total_students DESC

        `);


        res.json(records);


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Unable to load department analytics"

        });

    }

});


// ==========================================
// 5. RECENT BORROWING ACTIVITIES
// ==========================================

router.get("/recent-activities", async (req, res) => {

    try {

        const [records] = await db.execute(`

            SELECT

                br.borrowing_id,

                s.student_name,

                s.roll_number,

                b.title,

                br.issue_date,

                br.due_date,

                br.status

            FROM borrowings br

            JOIN students s

                ON br.student_id = s.student_id

            JOIN books b

                ON br.book_id = b.book_id

            ORDER BY br.borrowing_id DESC

            LIMIT 10

        `);


        res.json(records);


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Unable to load recent activities"

        });

    }

});

// BOOKS BY CATEGORY ANALYTICS
router.get("/books-by-category", async (req, res) => {
    try {

        const [records] = await db.execute(`
            SELECT
                c.category_name,
                COUNT(b.book_id) AS total_books
            FROM categories c
            LEFT JOIN books b
                ON c.category_id = b.category_id
            GROUP BY
                c.category_id,
                c.category_name
            ORDER BY total_books DESC
        `);

        res.json(records);

    } catch (error) {

        console.error("Books by category error:", error);

        res.status(500).json({
            message: "Unable to load books by category"
        });

    }
});


module.exports = router;