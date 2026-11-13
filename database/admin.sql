USE smart_library;

CREATE TABLE IF NOT EXISTS admins (

    admin_id INT AUTO_INCREMENT PRIMARY KEY,

    admin_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('admin') DEFAULT 'admin',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

) ENGINE=InnoDB;

DESCRIBE admins;