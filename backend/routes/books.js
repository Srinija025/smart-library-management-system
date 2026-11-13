const express = require("express");

const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

// =================================
// 1. GET ALL CATEGORIES
// =================================

router.get("/categories", async (req, res) => {

    try {

        const [categories] = await db.execute(
            "SELECT * FROM categories ORDER BY category_name"
        );

        res.json(categories);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to retrieve categories"
        });

    }

});


// =================================
// 2. GET ALL BOOKS AND SEARCH
// =================================

router.get("/", async (req, res) => {

    try {

        const search = req.query.search || "";

        const categoryId = req.query.categoryId || "";

        let sql = `
            SELECT
                b.book_id,
                b.title,
                b.author,
                b.isbn,
                b.category_id,
                c.category_name,
                b.total_quantity,
                b.available_quantity,
                b.created_at

            FROM books b

            INNER JOIN categories c

            ON b.category_id = c.category_id

           
             WHERE (
               b.title LIKE ?
               OR b.author LIKE ?
               OR b.isbn LIKE ?
               OR c.category_name LIKE ?


            )
        `;

        
const searchValue = `%${search}%`;

const values = [
    searchValue,
    searchValue,
    searchValue,
    searchValue
];


        if (categoryId !== "") {

            sql += " AND b.category_id = ?";

            values.push(Number(categoryId));

        }

        sql += " ORDER BY b.book_id DESC";

        const [books] = await db.execute(sql, values);

        res.json(books);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to retrieve books"
        });

    }

});


// =================================
// 3. ADD NEW BOOK
// =================================

router.post("/", async (req, res) => {

    try {

        const {
            title,
            author,
            isbn,
            category_id,
            total_quantity
        } = req.body;

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof author !== "string" ||
            !author.trim() ||
            typeof isbn !== "string" ||
            !isbn.trim()
        ) {

            return res.status(400).json({
                message: "Title, author and ISBN are required"
            });

        }

        const categoryId = Number(category_id);

        const quantity = Number(total_quantity);

        if (
            !Number.isInteger(categoryId) ||
            categoryId < 1 ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {

            return res.status(400).json({
                message: "Enter a valid category and quantity"
            });

        }

        const [result] = await db.execute(

            `INSERT INTO books
            (
                title,
                author,
                isbn,
                category_id,
                total_quantity,
                available_quantity
            )

            VALUES (?, ?, ?, ?, ?, ?)`,

            [
                title.trim(),
                author.trim(),
                isbn.trim(),
                categoryId,
                quantity,
                quantity
            ]

        );

        res.status(201).json({

            success: true,

            message: "Book added successfully",

            book_id: result.insertId

        });

    } catch (error) {

        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                message: "This ISBN already exists"
            });

        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {

            return res.status(400).json({
                message: "Selected category does not exist"
            });

        }

        res.status(500).json({
            message: "Unable to add book"
        });

    }

});


// =================================
// 4. UPDATE BOOK
// =================================

router.put("/:id", async (req, res) => {

    try {

        const bookId = Number(req.params.id);

        const {
            title,
            author,
            isbn,
            category_id,
            total_quantity
        } = req.body;

        const categoryId = Number(category_id);

        const quantity = Number(total_quantity);

        if (
            !Number.isInteger(bookId) ||
            bookId < 1 ||
            typeof title !== "string" ||
            !title.trim() ||
            typeof author !== "string" ||
            !author.trim() ||
            typeof isbn !== "string" ||
            !isbn.trim() ||
            !Number.isInteger(categoryId) ||
            categoryId < 1 ||
            !Number.isInteger(quantity) ||
            quantity < 0
        ) {

            return res.status(400).json({
                message: "Invalid book information"
            });

        }

        const [existing] = await db.execute(

            "SELECT * FROM books WHERE book_id = ?",

            [bookId]

        );

        if (existing.length === 0) {

            return res.status(404).json({
                message: "Book not found"
            });

        }

        const oldBook = existing[0];

        const issuedQuantity =
            oldBook.total_quantity -
            oldBook.available_quantity;

        if (quantity < issuedQuantity) {

            return res.status(400).json({

                message:
                    "Total quantity cannot be less than currently issued copies"

            });

        }

        const newAvailableQuantity =
            quantity - issuedQuantity;

        const [result] = await db.execute(

            `UPDATE books

            SET
                title = ?,
                author = ?,
                isbn = ?,
                category_id = ?,
                total_quantity = ?,
                available_quantity = ?

            WHERE book_id = ?`,

            [
                title.trim(),
                author.trim(),
                isbn.trim(),
                categoryId,
                quantity,
                newAvailableQuantity,
                bookId
            ]

        );

        res.json({

            success: true,

            message: "Book updated successfully"

        });

    } catch (error) {

        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({
                message: "This ISBN already exists"
            });

        }

        res.status(500).json({
            message: "Unable to update book"
        });

    }

});


// =================================
// 5. DELETE BOOK
// =================================

router.delete("/:id", async (req, res) => {

    try {

        const bookId = Number(req.params.id);

        if (!Number.isInteger(bookId) || bookId < 1) {

            return res.status(400).json({
                message: "Invalid book ID"
            });

        }

        const [result] = await db.execute(

            "DELETE FROM books WHERE book_id = ?",

            [bookId]

        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Book not found"
            });

        }

        res.json({

            success: true,

            message: "Book deleted successfully"

        });

    } catch (error) {

        console.error(error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {

            return res.status(409).json({

                message:
                    "This book has borrowing records and cannot be deleted"

            });

        }

        res.status(500).json({
            message: "Unable to delete book"
        });

    }

});

router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    // Keep your existing POST handler here
});

module.exports = router;