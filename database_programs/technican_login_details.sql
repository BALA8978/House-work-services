use homeservecesDatabase;

CREATE TABLE IF NOT EXISTS technician_login_details (
    id INT AUTO_INCREMENT PRIMARY KEY,             -- Unique identifier for each user
    full_name VARCHAR(255) NOT NULL,               -- Stores the user's full name
    email VARCHAR(255) UNIQUE NOT NULL,            -- Stores the user's email, must be unique
    password VARCHAR(255) NOT NULL,                -- Stores the hashed password (NEVER plain text)
    role ENUM('customer', 'technician', 'admin') NOT NULL, -- Stores 'customer' or 'technician' (from your form)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically records when the user registered
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Automatically updates on row modification
);


-- INSERT 10 Technicians into the 'users' table
INSERT INTO technician_login_details (full_name, email, password, role) VALUES
('Alice Smith', 'alice.s@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS1', 'technician'),
('Bob Johnson', 'bob.j@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS2', 'technician'),
('Charlie Davis', 'charlie.d@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS3', 'technician'),
('Diana Garcia', 'diana.g@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS4', 'technician'),
('Evan Martinez', 'evan.m@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS5', 'technician'),
('Fiona Lee', 'fiona.l@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS6', 'technician'),
('George Brown', 'george.b@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS7', 'technician'),
('Hannah Wilson', 'hannah.w@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS8', 'technician'),
('Ivan Moore', 'ivan.m@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS9', 'technician'),
('Julia Taylor', 'julia.t@example.com', 'YOUR_HASHED_PASSWORD_FOR_TECHPASS10', 'technician');