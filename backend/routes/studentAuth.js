

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

// STUDENT REGISTRATION
// Student must already exist in the students table.
router.post("/register", async (req, res) => {
    try {
        const { email, roll_number, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof roll_number !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !roll_number.trim() ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: "Enter email, roll number and a password of at least 8 characters"
            });
        }

        const [students] = await db.execute(
            `SELECT student_id, student_name, email, password_hash
             FROM students
             WHERE email = ? AND roll_number = ?`,
            [email.trim(), roll_number.trim()]
        );

        if (students.length === 0) {
            return res.status(404).json({
                message: "Student record not found. Contact the library administrator."
            });
        }

        if (students[0].password_hash) {
            return res.status(409).json({
                message: "Student account is already registered. Please log in."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await db.execute(
            `UPDATE students
             SET password_hash = ?
             WHERE student_id = ?`,
            [hashedPassword, students[0].student_id]
        );

        return res.status(201).json({
            success: true,
            message: "Student account created successfully"
        });

    } catch (error) {
        console.error("Student registration error:", error);
        return res.status(500).json({
            message: "Student registration failed"
        });
    }
});


// STUDENT LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const [students] = await db.execute(
            `SELECT student_id, student_name, email, password_hash
             FROM students
             WHERE email = ?`,
            [email.trim()]
        );

        if (
            students.length === 0 ||
            !students[0].password_hash
        ) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const student = students[0];

        const validPassword = await bcrypt.compare(
            password,
            student.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const token = jwt.sign(
            {
                student_id: student.student_id,
                role: "student"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h",
                issuer: "smart-library"
            }
        );

        return res.json({
            success: true,
            message: "Student login successful",
            token,
            student: {
                student_id: student.student_id,
                student_name: student.student_name,
                email: student.email
            }
        });

    } catch (error) {
        console.error("Student login error:", error);
        return res.status(500).json({
            message: "Student login service unavailable"
        });
    }
});

module.exports = router;
