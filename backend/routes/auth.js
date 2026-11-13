const express = require("express");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const router = express.Router();

const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

// ADMIN LOGIN

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


        const [admins] = await db.execute(

            `SELECT *

             FROM admins

             WHERE email = ?`,

            [email.trim()]

        );


        if (admins.length === 0) {

            return res.status(401).json({

                message: "Invalid email or password"

            });

        }


        const admin = admins[0];


        const validPassword = await bcrypt.compare(

            password,

            admin.password_hash

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

                admin_id: admin.admin_id,

                role: admin.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn: "2h",

                issuer: "smart-library"

            }

        );


        res.json({

            success: true,

            message: "Login successful",

            token: token,

            admin: {

                admin_id: admin.admin_id,

                admin_name: admin.admin_name,

                email: admin.email,

                role: admin.role

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Login service unavailable"

        });

    }

});


// =====================================
// ADMIN PROFILE AND SETTINGS APIs
// =====================================

// GET ADMIN PROFILE
router.get(
    "/profile",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
        try {
            const adminId = req.user.admin_id;

            const [admins] = await db.execute(
                `SELECT admin_id, admin_name, email, role
                 FROM admins
                 WHERE admin_id = ?`,
                [adminId]
            );

            if (admins.length === 0) {
                return res.status(404).json({
                    message: "Admin not found"
                });
            }

            res.json({
                success: true,
                admin: admins[0]
            });

        } catch (error) {
            console.error("Admin profile error:", error);

            res.status(500).json({
                message: "Unable to load admin profile"
            });
        }
    }
);


// UPDATE ADMIN PROFILE
router.put(
    "/profile",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
        try {
            const adminId = req.user.admin_id;

            const { admin_name, email } = req.body;

            if (
                typeof admin_name !== "string" ||
                typeof email !== "string" ||
                !admin_name.trim() ||
                !email.trim()
            ) {
                return res.status(400).json({
                    message: "Name and email are required"
                });
            }

            const cleanName = admin_name.trim();
            const cleanEmail = email.trim();

            // Check whether another admin uses this email
            const [existing] = await db.execute(
                `SELECT admin_id
                 FROM admins
                 WHERE email = ? AND admin_id != ?`,
                [cleanEmail, adminId]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    message: "This email is already in use"
                });
            }

            await db.execute(
                `UPDATE admins
                 SET admin_name = ?, email = ?
                 WHERE admin_id = ?`,
                [cleanName, cleanEmail, adminId]
            );

            res.json({
                success: true,
                message: "Admin profile updated successfully",
                admin: {
                    admin_id: adminId,
                    admin_name: cleanName,
                    email: cleanEmail
                }
            });

        } catch (error) {
            console.error("Profile update error:", error);

            res.status(500).json({
                message: "Unable to update admin profile"
            });
        }
    }
);


// GET ADMIN NOTIFICATION SETTINGS
router.get(
    "/settings",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
        try {
            const adminId = req.user.admin_id;

            const [rows] = await db.execute(
                `SELECT
                    overdue_notifications,
                    request_notifications,
                    return_notifications
                 FROM admin_settings
                 WHERE admin_id = ?`,
                [adminId]
            );

            if (rows.length === 0) {
                return res.json({
                    success: true,
                    settings: {
                        overdue_notifications: 1,
                        request_notifications: 1,
                        return_notifications: 1
                    }
                });
            }

            res.json({
                success: true,
                settings: rows[0]
            });

        } catch (error) {
            console.error("Settings fetch error:", error);

            res.status(500).json({
                message: "Unable to load notification settings"
            });
        }
    }
);


// UPDATE ADMIN NOTIFICATION SETTINGS
router.put(
    "/settings",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
        try {
            const adminId = req.user.admin_id;

            const {
                overdue_notifications,
                request_notifications,
                return_notifications
            } = req.body;

            const values = [
                overdue_notifications,
                request_notifications,
                return_notifications
            ];

            if (
                values.some(value => typeof value !== "boolean")
            ) {
                return res.status(400).json({
                    message: "All notification values must be true or false"
                });
            }

            await db.execute(
                `INSERT INTO admin_settings (
                    admin_id,
                    overdue_notifications,
                    request_notifications,
                    return_notifications
                )
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    overdue_notifications = VALUES(overdue_notifications),
                    request_notifications = VALUES(request_notifications),
                    return_notifications = VALUES(return_notifications)`,
                [
                    adminId,
                    overdue_notifications,
                    request_notifications,
                    return_notifications
                ]
            );

            res.json({
                success: true,
                message: "Notification settings saved successfully"
            });

        } catch (error) {
            console.error("Settings update error:", error);

            res.status(500).json({
                message: "Unable to save notification settings"
            });
        }
    }
);


// =====================================
// CHANGE ADMIN PASSWORD
// =====================================

router.put(
    "/change-password",
    verifyToken,
    requireRole("admin"),
    async (req, res) => {
        try {
            const adminId = req.user.admin_id;

            const {
                currentPassword,
                newPassword
            } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    message: "Both passwords are required"
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    message: "New password must contain at least 8 characters"
                });
            }

            const [admins] = await db.execute(
                `SELECT password_hash
                 FROM admins
                 WHERE admin_id = ?`,
                [adminId]
            );

            if (admins.length === 0) {
                return res.status(404).json({
                    message: "Admin not found"
                });
            }

            const validPassword = await bcrypt.compare(
                currentPassword,
                admins[0].password_hash
            );

            if (!validPassword) {
                return res.status(401).json({
                    message: "Current password is incorrect"
                });
            }

            const hashedPassword = await bcrypt.hash(
                newPassword,
                10
            );

            await db.execute(
                `UPDATE admins
                 SET password_hash = ?
                 WHERE admin_id = ?`,
                [hashedPassword, adminId]
            );

            res.json({
                success: true,
                message: "Password changed successfully"
            });

        } catch (error) {
            console.error("Password change error:", error);

            res.status(500).json({
                message: "Unable to change password"
            });
        }
    }
);


module.exports = router;