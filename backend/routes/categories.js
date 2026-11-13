const express = require("express");
const router = express.Router();
const db = require("../db");

const verifyToken = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");

// 1. Get all categories
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM categories ORDER BY category_id DESC"
        );

        res.json(rows);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
});

// 2. Add a category
router.post("/", async (req, res) => {
    try {
        const { category_name, description } = req.body;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const [result] = await db.execute(
            "INSERT INTO categories (category_name, description) VALUES (?, ?)",
            [category_name.trim(), description || ""]
        );

        res.status(201).json({
            message: "Category added successfully",
            category_id: result.insertId
        });
    } catch (error) {
        console.error("Error adding category:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This category already exists"
            });
        }

        res.status(500).json({ message: "Failed to add category" });
    }
});

// 3. Update a category
router.put("/:id", async (req, res) => {
    try {
        const { category_name, description, status } = req.body;
        const { id } = req.params;

        if (!category_name || !category_name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const [result] = await db.execute(
            `UPDATE categories
             SET category_name = ?, description = ?, status = ?
             WHERE category_id = ?`,
            [category_name.trim(), description || "", status || "Active", id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category updated successfully" });
    } catch (error) {
        console.error("Error updating category:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "This category name already exists"
            });
        }

        res.status(500).json({ message: "Failed to update category" });
    }
});

// 4. Delete a category
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            "DELETE FROM categories WHERE category_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "This category is assigned to books. Reassign those books before deleting it."
            });
        }

        res.status(500).json({ message: "Failed to delete category" });
    }
});

module.exports = router;