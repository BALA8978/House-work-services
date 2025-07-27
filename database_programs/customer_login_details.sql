use homeservecesDatabase;

create table if not exists customer_login_details (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer'
);

INSERT INTO customer_login_details (customer_id, full_name, email, password, role) VALUES

-- 1. Customer
(1,'Emily Clark', 'emily.c@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS1', 'customer'),
-- 2. Customer
(2,'David Lee', 'david.l@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS2', 'customer'),
-- 3. Customer
(3,'Sarah Taylor', 'sarah.t@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS3', 'customer'),
-- 4. Customer
(4,'Michael Brown', 'michael.b@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS4', 'customer'),
-- 5. Customer
(5,'Jessica Wilson', 'jessica.w@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS5', 'customer'),
-- 6. Customer
(6,'Daniel Green', 'daniel.g@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS6', 'customer'),
-- 7. Customer
(7,'Laura White', 'laura.w@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS7', 'customer'),
-- 8. Customer
(8,'Chris Harris', 'chris.h@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS8', 'customer'),
-- 9. Customer
(9,'Megan King', 'megan.k@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS9', 'customer'),
-- 10. Customer
(10,'Ryan Scott', 'ryan.s@example.com', 'YOUR_GENERATED_HASH_FOR_CUSTOMERPASS10', 'customer');