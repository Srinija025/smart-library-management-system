const express = require("express");

const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

// ==========================================
// 1. GET BORROWING RECORDS
// ==========================================

router.get("/", async (req, res) => {

    try {

        const { status, search } = req.query;

        let sql = `
            SELECT
                br.borrowing_id,
                br.student_id,
                br.book_id,
                DATE_FORMAT(br.issue_date, '%Y-%m-%d') AS issue_date,

DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,

DATE_FORMAT(br.return_date, '%Y-%m-%d') AS return_date,
                br.status,

                s.student_name,
                s.roll_number,

                b.title,
                b.author

            FROM borrowings br

            JOIN students s
                ON br.student_id = s.student_id

            JOIN books b
                ON br.book_id = b.book_id

            WHERE 1 = 1
        `;

        const values = [];


        if (status === "Issued" || status === "Returned") {

            sql += " AND br.status = ? ";

            values.push(status);

        }


        if (status === "Overdue") {

            sql += `
                AND br.status = 'Issued'
                AND br.due_date < CURRENT_DATE()
            `;

        }


        if (search && search.trim()) {

            sql += `
                AND (
                    s.student_name LIKE ?
                    OR s.roll_number LIKE ?
                    OR b.title LIKE ?
                )
            `;

            const searchValue = `%${search.trim()}%`;

            values.push(
                searchValue,
                searchValue,
                searchValue
            );

        }


        sql += " ORDER BY br.borrowing_id DESC";


        const [records] = await db.execute(sql, values);


        res.json(records);


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Unable to retrieve borrowing records"

        });

    }

});


// ==========================================
// OVERDUE NOTIFICATIONS
// ==========================================

router.get("/overdue-notifications", async (req, res) => {

    try {

        const [records] = await db.execute(`

            SELECT
                br.borrowing_id,
                s.student_name,
                s.roll_number,
                b.title,
                DATE_FORMAT(br.due_date, '%Y-%m-%d') AS due_date,
                DATEDIFF(CURRENT_DATE(), br.due_date) AS overdue_days

            FROM borrowings br

            JOIN students s
                ON br.student_id = s.student_id

            JOIN books b
                ON br.book_id = b.book_id

            WHERE br.status = 'Issued'
            AND br.due_date < CURRENT_DATE()

            ORDER BY br.due_date ASC

        `);

        res.json({
            count: records.length,
            notifications: records
        });

    } catch (error) {

        console.error("Overdue notification error:", error);

        res.status(500).json({
            message: "Unable to load overdue notifications"
        });

    }

});



// ==========================================
// 2. ISSUE A BOOK
// ==========================================

router.post("/issue", async (req, res) => {

    let connection;

    try {

        const {

            student_id,
            book_id,
            issue_date,
            due_date

        } = req.body;


        // VALIDATION

        const validDate = (date) => {

            if (
                typeof date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(date)
            ) {

                return false;

            }

            const parsed = new Date(date + "T00:00:00Z");

            return !Number.isNaN(parsed.getTime()) &&
                parsed.toISOString().slice(0, 10) === date;

        };


        if (
            !Number.isInteger(Number(student_id)) ||
            Number(student_id) < 1 ||
            !Number.isInteger(Number(book_id)) ||
            Number(book_id) < 1 ||
            !validDate(issue_date) ||
            !validDate(due_date) ||
            due_date < issue_date
        ) {

            return res.status(400).json({

                message: "Enter valid student, book and date details"

            });

        }


        // START TRANSACTION

        connection = await db.getConnection();

        await connection.beginTransaction();


        // CHECK STUDENT

        const [students] = await connection.execute(

            "SELECT student_id FROM students WHERE student_id = ?",

            [student_id]

        );


        if (students.length === 0) {

            throw new Error("Student not found");

        }


        // LOCK BOOK RECORD

        const [books] = await connection.execute(

            `SELECT book_id, title, available_quantity

             FROM books

             WHERE book_id = ?

             FOR UPDATE`,

            [book_id]

        );


        if (books.length === 0) {

            throw new Error("Book not found");

        }


        if (books[0].available_quantity <= 0) {

            throw new Error("This book is currently unavailable");

        }


        // INSERT BORROWING RECORD

        const [result] = await connection.execute(

            `INSERT INTO borrowings

            (
                student_id,
                book_id,
                issue_date,
                due_date,
                status
            )

            VALUES (?, ?, ?, ?, 'Issued')`,

            [
                student_id,
                book_id,
                issue_date,
                due_date
            ]

        );


        // REDUCE AVAILABLE QUANTITY

        await connection.execute(

            `UPDATE books

             SET available_quantity = available_quantity - 1

             WHERE book_id = ?

             AND available_quantity > 0`,

            [book_id]

        );


        // COMMIT TRANSACTION

        await connection.commit();


        res.status(201).json({

            success: true,

            message: "Book issued successfully",

            borrowing_id: result.insertId

        });


    } catch (error) {


        if (connection) {

            await connection.rollback();

        }


        console.error(error);


        if (
            error.message === "Student not found" ||
            error.message === "Book not found" ||
            error.message === "This book is currently unavailable"
        ) {

            return res.status(400).json({

                message: error.message

            });

        }


        res.status(500).json({

            message: "Book issue failed",

            error: error.message

        });


    } finally {


        if (connection) {

            connection.release();

        }

    }

});


// ==========================================
// 3. RETURN A BOOK
// ==========================================

router.put("/:id/return", async (req, res) => {

    let connection;

    try {

        const borrowingId = Number(req.params.id);


        if (
            !Number.isInteger(borrowingId) ||
            borrowingId < 1
        ) {

            return res.status(400).json({

                message: "Invalid borrowing ID"

            });

        }


        connection = await db.getConnection();

        await connection.beginTransaction();


        // LOCK BORROWING RECORD

        const [records] = await connection.execute(

            `SELECT borrowing_id, book_id, status

             FROM borrowings

             WHERE borrowing_id = ?

             FOR UPDATE`,

            [borrowingId]

        );


        if (records.length === 0) {

            throw new Error("Borrowing record not found");

        }


        const record = records[0];


        if (record.status === "Returned") {

            throw new Error("This book has already been returned");

        }


        // UPDATE BORROWING STATUS

        await connection.execute(

            `UPDATE borrowings

             SET

                status = 'Returned',

                return_date = CURRENT_DATE()

             WHERE borrowing_id = ?`,

            [borrowingId]

        );


        // INCREASE AVAILABLE QUANTITY

        await connection.execute(

            `UPDATE books

             SET available_quantity = available_quantity + 1

             WHERE book_id = ?`,

            [record.book_id]

        );


        await connection.commit();


        res.json({

            success: true,

            message: "Book returned successfully"

        });


    } catch (error) {


        if (connection) {

            await connection.rollback();

        }


        console.error(error);


        if (
            error.message === "Borrowing record not found" ||
            error.message === "This book has already been returned"
        ) {

            return res.status(400).json({

                message: error.message

            });

        }


        res.status(500).json({

            message: "Book return failed",

            error: error.message

        });


    } finally {


        if (connection) {

            connection.release();

        }

    }

});


// ==========================================
// 4. ADMIN: VIEW ALL BOOK REQUESTS
// ==========================================

router.get("/requests", verifyToken, requireRole("admin"), async (req, res) => {

    try {

        const [requests] = await db.execute(`

            SELECT
                br.request_id,
                br.student_id,
                br.book_id,
                br.request_date,
                br.status,
                br.admin_remarks,

                s.student_name,
                s.roll_number,

                b.title,
                b.author

            FROM book_requests br

            JOIN students s
                ON br.student_id = s.student_id

            JOIN books b
                ON br.book_id = b.book_id

            ORDER BY
                CASE
                    WHEN br.status = 'Pending' THEN 0
                    ELSE 1
                END,
                br.request_date DESC

        `);

        res.json(requests);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load book requests"
        });

    }

});


// ==========================================
// 5. ADMIN: APPROVE A BOOK REQUEST
// ==========================================

router.patch("/requests/:id/approve", verifyToken, requireRole("admin"), async (req, res) => {

    try {

        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId) || requestId <= 0) {

            return res.status(400).json({
                message: "Invalid request ID"
            });

        }

        const [result] = await db.execute(

            `UPDATE book_requests
             SET status = 'Approved'
             WHERE request_id = ?
             AND status = 'Pending'`,

            [requestId]

        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Pending book request not found"
            });

        }

        res.json({
            message: "Book request approved successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to approve book request"
        });

    }

});


// ==========================================
// 6. ADMIN: REJECT A BOOK REQUEST
// ==========================================

router.patch("/requests/:id/reject", verifyToken, requireRole("admin"), async (req, res) => {

    try {

        const requestId = Number(req.params.id);
        const remarks = req.body.admin_remarks || null;

        if (!Number.isInteger(requestId) || requestId <= 0) {

            return res.status(400).json({
                message: "Invalid request ID"
            });

        }

        const [result] = await db.execute(

            `UPDATE book_requests
             SET status = 'Rejected',
                 admin_remarks = ?
             WHERE request_id = ?
             AND status = 'Pending'`,

            [remarks, requestId]

        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Pending book request not found"
            });

        }

        res.json({
            message: "Book request rejected successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to reject book request"
        });

    }

});

// ==========================================
// 7. ADMIN: ISSUE AN APPROVED BOOK REQUEST
// ==========================================

router.post("/requests/:id/issue", verifyToken, requireRole("admin"), async (req, res) => {

    const connection = await db.getConnection();

    try {

        const requestId = Number(req.params.id);
        const { issue_date, due_date } = req.body;

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                message: "Invalid request ID"
            });
        }

        if (!issue_date || !due_date) {
            return res.status(400).json({
                message: "Issue date and due date are required"
            });
        }

        await connection.beginTransaction();

        // 1. Find and lock the approved request

        const [requests] = await connection.execute(
            `SELECT request_id, student_id, book_id, status
             FROM book_requests
             WHERE request_id = ?
             FOR UPDATE`,
            [requestId]
        );

        if (requests.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                message: "Book request not found"
            });
        }

        const request = requests[0];

        if (request.status !== "Approved") {
            await connection.rollback();

            return res.status(400).json({
                message: "Only approved requests can be issued"
            });
        }

        // 2. Lock the book and check availability

        const [books] = await connection.execute(
            `SELECT book_id, available_quantity
             FROM books
             WHERE book_id = ?
             FOR UPDATE`,
            [request.book_id]
        );

        if (
            books.length === 0 ||
            books[0].available_quantity <= 0
        ) {
            await connection.rollback();

            return res.status(400).json({
                message: "Book is currently unavailable"
            });
        }

        // 3. Create borrowing record

        const [borrowing] = await connection.execute(
            `INSERT INTO borrowings
             (student_id, book_id, issue_date, due_date, status)
             VALUES (?, ?, ?, ?, 'Issued')`,
            [
                request.student_id,
                request.book_id,
                issue_date,
                due_date
            ]
        );

        // 4. Reduce available book quantity

        await connection.execute(
            `UPDATE books
             SET available_quantity = available_quantity - 1
             WHERE book_id = ?`,
            [request.book_id]
        );

        // 5. Update request status

        await connection.execute(
            `UPDATE book_requests
             SET status = 'Issued'
             WHERE request_id = ?`,
            [requestId]
        );

        await connection.commit();

        res.json({
            message: "Book issued successfully",
            borrowing_id: borrowing.insertId
        });

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            message: "Unable to issue book"
        });

    } finally {

        connection.release();

    }

});

// ==========================================
// 8. ADMIN: VIEW ALL RETURN REQUESTS
// ==========================================

router.get("/return-requests", verifyToken, requireRole("admin"), async (req, res) => {
    try {

        const [requests] = await db.execute(`
            SELECT
                rr.return_request_id,
                rr.borrowing_id,
                rr.student_id,
                rr.request_date,
                rr.status,
                s.student_name,
                s.roll_number,
                b.title,
                b.author,
                br.issue_date,
                br.due_date
            FROM return_requests rr
            JOIN students s
                ON rr.student_id = s.student_id
            JOIN borrowings br
                ON rr.borrowing_id = br.borrowing_id
            JOIN books b
                ON br.book_id = b.book_id
            ORDER BY
                CASE WHEN rr.status = 'Pending' THEN 0 ELSE 1 END,
                rr.request_date DESC
        `);

        res.json(requests);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load return requests"
        });

    }
});

// ==========================================
// 9. ADMIN: CONFIRM BOOK RETURN
// ==========================================

router.patch("/return-requests/:id/confirm", verifyToken, requireRole("admin"), async (req, res) => {

    let connection;

    try {

        const requestId = Number(req.params.id);

        if (!Number.isInteger(requestId) || requestId <= 0) {
            return res.status(400).json({
                message: "Invalid return request ID"
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // 1. Find and lock return request

        const [requests] = await connection.execute(
            `SELECT return_request_id, borrowing_id, status
             FROM return_requests
             WHERE return_request_id = ?
             FOR UPDATE`,
            [requestId]
        );

        if (requests.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                message: "Return request not found"
            });
        }

        const request = requests[0];

        if (request.status !== "Pending") {

            await connection.rollback();

            return res.status(400).json({
                message: "This return request is not pending"
            });
        }

        // 2. Find and lock borrowing record

        const [borrowings] = await connection.execute(
            `SELECT borrowing_id, book_id, status
             FROM borrowings
             WHERE borrowing_id = ?
             FOR UPDATE`,
            [request.borrowing_id]
        );

        if (
            borrowings.length === 0 ||
            borrowings[0].status !== "Issued"
        ) {

            await connection.rollback();

            return res.status(400).json({
                message: "Book is not currently issued"
            });
        }

        const bookId = borrowings[0].book_id;

        // 3. Update borrowing status

        await connection.execute(
            `UPDATE borrowings
             SET status = 'Returned',
                 return_date = CURRENT_DATE
             WHERE borrowing_id = ?`,
            [request.borrowing_id]
        );

        // 4. Increase available book quantity

        await connection.execute(
            `UPDATE books
             SET available_quantity = available_quantity + 1
             WHERE book_id = ?`,
            [bookId]
        );

        // 5. Confirm return request

        await connection.execute(
            `UPDATE return_requests
             SET status = 'Confirmed'
             WHERE return_request_id = ?`,
            [requestId]
        );

        await connection.commit();

        res.json({
            message: "Book return confirmed successfully"
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(error);

        res.status(500).json({
            message: "Unable to confirm book return"
        });

    } finally {

        if (connection) {
            connection.release();
        }

    }

});

module.exports = router;