const bcrypt = require("bcrypt");
const db = require("./db");

async function createAdmin() {
    const name = "Library Administrator";
    const email = "admin@smartlibrary.com";
    const password = "Admin@12345";

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        await db.execute(
            `INSERT INTO admins
            (admin_name, email, password_hash, role)
            VALUES (?, ?, ?, 'admin')
            ON DUPLICATE KEY UPDATE
            admin_name = VALUES(admin_name),
            password_hash = VALUES(password_hash),
            role = 'admin'`,
            [name, email, hashedPassword]
        );

        console.log("Admin account created successfully!");
        console.log("Email:", email);
        console.log("Password:", password);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
    } finally {
        await db.end();
    }
}

createAdmin();