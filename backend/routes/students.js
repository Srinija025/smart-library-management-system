const express = require("express");

const router = express.Router();

const db = require("../db");

const verifyAdmin = require("../middleware/authMiddleware");

router.use(verifyAdmin);

// =====================================
// 1. GET ALL STUDENTS AND SEARCH
// =====================================

router.get("/", async (req, res) => {

    try {

        const search = req.query.search || "";

        const department = req.query.department || "";

        const sql = `
            SELECT
                student_id,
                student_name,
                roll_number,
                email,
                phone,
                department,
                academic_year,
                created_at

            FROM students

            WHERE (
                student_name LIKE ?
                OR roll_number LIKE ?
                OR email LIKE ?
                OR department LIKE ?
            )

            AND department LIKE ?

            ORDER BY student_id DESC
        `;

        const searchValue = `%${search}%`;

        const departmentValue = department
            ? department
            : "%";

        const [students] = await db.execute(sql, [

            searchValue,
            searchValue,
            searchValue,
            searchValue,
            departmentValue

        ]);

        res.json(students);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Unable to retrieve students"

        });

    }

});


// =====================================
// 2. GET STUDENT BY ID
// =====================================

router.get("/:id", async (req, res) => {

    try {

        const studentId = Number(req.params.id);

        if (!Number.isInteger(studentId) || studentId < 1) {

            return res.status(400).json({
                message: "Invalid student ID"
            });

        }

        const [students] = await db.execute(

            "SELECT * FROM students WHERE student_id = ?",

            [studentId]

        );

        if (students.length === 0) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        res.json(students[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to retrieve student"
        });

    }

});


// =====================================
// 3. ADD NEW STUDENT
// =====================================

router.post("/", async (req, res) => {

    try {

        const {

            student_name,
            roll_number,
            email,
            phone,
            department,
            academic_year

        } = req.body;


        if (

            typeof student_name !== "string" ||
            !student_name.trim() ||

            typeof roll_number !== "string" ||
            !roll_number.trim() ||

            typeof email !== "string" ||
            !email.trim() ||

            typeof department !== "string" ||
            !department.trim() ||

            typeof academic_year !== "string" ||
            !academic_year.trim()

        ) {

            return res.status(400).json({

                message: "Please enter all required student details"

            });

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {

            return res.status(400).json({

                message: "Enter a valid email address"

            });

        }


        if (
            phone &&
            !/^[0-9+\-\s()]{7,20}$/.test(phone.trim())
        ) {

            return res.status(400).json({

                message: "Enter a valid phone number"

            });

        }


        const [result] = await db.execute(

            `INSERT INTO students
            (
                student_name,
                roll_number,
                email,
                phone,
                department,
                academic_year
            )

            VALUES (?, ?, ?, ?, ?, ?)`,

            [

                student_name.trim(),
                roll_number.trim(),
                email.trim(),
                phone ? phone.trim() : null,
                department.trim(),
                academic_year.trim()

            ]

        );


        res.status(201).json({

            success: true,

            message: "Student registered successfully",

            student_id: result.insertId

        });

    } catch (error) {

        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({

                message: "Roll number or email already exists"

            });

        }

        res.status(500).json({

            message: "Unable to register student"

        });

    }

});


// =====================================
// 4. UPDATE STUDENT
// =====================================

router.put("/:id", async (req, res) => {

    try {

        const studentId = Number(req.params.id);

        const {

            student_name,
            roll_number,
            email,
            phone,
            department,
            academic_year

        } = req.body;


        if (
            !Number.isInteger(studentId) ||
            studentId < 1 ||
            typeof student_name !== "string" ||
            !student_name.trim() ||
            typeof roll_number !== "string" ||
            !roll_number.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof department !== "string" ||
            !department.trim() ||
            typeof academic_year !== "string" ||
            !academic_year.trim()
        ) {

            return res.status(400).json({

                message: "Invalid student information"

            });

        }


        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {

            return res.status(400).json({

                message: "Enter a valid email address"

            });

        }


        if (
            phone &&
            !/^[0-9+\-\s()]{7,20}$/.test(phone.trim())
        ) {

            return res.status(400).json({

                message: "Enter a valid phone number"

            });

        }


        const [result] = await db.execute(

            `UPDATE students

            SET
                student_name = ?,
                roll_number = ?,
                email = ?,
                phone = ?,
                department = ?,
                academic_year = ?

            WHERE student_id = ?`,

            [

                student_name.trim(),
                roll_number.trim(),
                email.trim(),
                phone ? phone.trim() : null,
                department.trim(),
                academic_year.trim(),
                studentId

            ]

        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message: "Student not found"

            });

        }


        res.json({

            success: true,

            message: "Student details updated successfully"

        });

    } catch (error) {

        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {

            return res.status(409).json({

                message: "Roll number or email already exists"

            });

        }

        res.status(500).json({

            message: "Unable to update student"

        });

    }

});


// =====================================
// 5. DELETE STUDENT
// =====================================

router.delete("/:id", async (req, res) => {

    try {

        const studentId = Number(req.params.id);

        if (!Number.isInteger(studentId) || studentId < 1) {

            return res.status(400).json({

                message: "Invalid student ID"

            });

        }


        const [result] = await db.execute(

            "DELETE FROM students WHERE student_id = ?",

            [studentId]

        );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                message: "Student not found"

            });

        }


        res.json({

            success: true,

            message: "Student deleted successfully"

        });

    } catch (error) {

        console.error(error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {

            return res.status(409).json({

                message:
                    "Student has borrowing records and cannot be deleted"

            });

        }

        res.status(500).json({

            message: "Unable to delete student"

        });

    }

});



module.exports = router;