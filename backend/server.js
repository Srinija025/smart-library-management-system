const express = require("express");
const cors = require("cors");

require("dotenv").config();

const db = require("./db");

const booksRoutes = require("./routes/books");
const studentsRoutes = require("./routes/students");
const borrowingsRoutes = require("./routes/borrowings");
const analyticsRoutes = require("./routes/analytics");
const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const verifyAdmin =
    require("./middleware/authMiddleware");


const studentAuthRoutes =
    require("./routes/studentAuth");

const studentPortalRoutes =
    require("./routes/studentPortal");

const verifyToken = require("./middleware/verifyToken");
const requireRole = require("./middleware/requireRole");

const app = express();

app.use(cors());

app.use(express.json());


// HOME ROUTE

app.get("/", (req, res) => {

    res.send("Smart Library Backend Running!");

});


// HEALTH CHECK

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "Backend is working successfully"
    });

});


// DATABASE CONNECTION CHECK

app.get("/api/db-check", async (req, res) => {

    try {

        const [result] = await db.execute(
            "SELECT DATABASE() AS database_name"
        );

        res.json({

            success: true,

            message: "MySQL connected successfully",

            database: result[0].database_name

        });

    } catch (error) {

        console.error("Database error:", error);

        res.status(500).json({

            success: false,

            message: "MySQL connection failed",

            error: error.message

        });

    }

});


// BOOK MANAGEMENT ROUTES

app.use("/api/books", booksRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/borrowings", borrowingsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);


// STUDENT AUTHENTICATION

app.use(
    "/api/student-auth",
    studentAuthRoutes
);

// STUDENT DASHBOARD

app.use(
    "/api/student",
    studentPortalRoutes
);


// START SERVER

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Backend running at http://localhost:${PORT}`
    );

});