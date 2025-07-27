USE homeservecesDatabase;

CREATE TABLE IF NOT EXISTS technicians_details (
    id VARCHAR(10) NOT NULL,
    name VARCHAR(100) DEFAULT NULL,
    isAvailable TINYINT(1) DEFAULT NULL,
    rating FLOAT DEFAULT NULL,
    experience INT(11) DEFAULT NULL,
    services TEXT DEFAULT NULL,
    price INT(11) DEFAULT NULL,
    PRIMARY KEY (id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO technicians_details (id, name, isAvailable, rating, experience, services, price) VALUES
('T001', 'Alice Smith', 1, 4.5, 5, 'Plumbing, Electrical', 1500),
('T002', 'Bob Johnson', 1, 4.0, 8, 'Lawn Mowing, Tree Trimming', 1200),
('T003', 'Charlie Davis', 0, 3.8, 3, 'Smart Home Setup, Electrical', 2000),
('T004', 'Diana Garcia', 1, 4.7, 10, 'Painting, Fence Repair, Carpentry', 1800),
('T005', 'Evan Martinez', 1, 4.2, 6, 'Pest Control, Snow Removal', 1400),
('T006', 'Fiona Lee', 0, 3.9, 4, 'Pool Maintenance, Pressure Washing', 1600),
('T007', 'George Brown', 1, 4.3, 7, 'Carpentry, Fence Repair', 1550),
('T008', 'Hannah Wilson', 1, 4.8, 9, 'Plumbing, Painting', 1700),
('T009', 'Ivan Moore', 0, 3.6, 2, 'Lawn Mowing, Pest Control', 1300),
('T010', 'Julia Taylor', 1, 4.1, 5, 'Smart Home Setup, Electrical', 2100),
('T011', 'Kevin Anderson', 1, 3.7, 3, 'Painting, Fence Repair, Pressure Washing', 1500),
('T012', 'Laura Thomas', 1, 4.4, 8, 'Snow Removal, Pool Maintenance, Tree Trimming', 1900),
('T013', 'Mike Harris', 0, 3.9, 6, 'Carpentry, Plumbing', 1650),
('T014', 'Nina Clark', 1, 4.5, 7, 'Pest Control, Lawn Mowing', 1400),
('T015', 'Oscar Lewis', 1, 4.0, 4, 'Smart Home Setup, Electrical', 2200),
('T016', 'Paula Walker', 0, 3.8, 3, 'Painting, Fence Repair', 1500),
('T017', 'Quinn Hall', 1, 4.3, 9, 'Pressure Washing, Pool Maintenance', 1700),
('T018', 'Rachel Allen', 1, 4.6, 8, 'Carpentry, Snow Removal', 1600),
('T019', 'Sam Young', 0, 3.7, 2, 'Plumbing', 1400),
('T020', 'Tina King', 1, 4.2, 5, 'Lawn Mowing, Tree Trimming', 1300),
('T021', 'Uma Scott', 1, 4.4, 6, 'Smart Home Setup', 2100),
('T022', 'Victor Green', 0, 3.9, 4, 'Painting, Fence Repair', 1500),
('T023', 'Wendy Adams', 1, 4.7, 10, 'Pest Control, Pressure Washing', 1900),
('T024', 'Xander Nelson', 1, 4.1, 7, 'Pool Maintenance, Carpentry', 1600),
('T025', 'Yvonne Carter', 0, 3.8, 3, 'Snow Removal, Plumbing', 1500),
('T026', 'Zach Baker', 1, 4.3, 5, 'Electrical, Smart Home Setup', 2200),
('T027', 'Aaron Phillips', 1, 4.0, 6, 'Lawn Mowing', 1400),
('T028', 'Bella Campbell', 0, 3.9, 4, 'Painting, Fence Repair, Pest Control', 1600),
('T029', 'Chris Evans', 1, 4.5, 9, 'Pressure Washing, Pool Maintenance', 1800),
('T030', 'Dana Mitchell', 1, 4.2, 7, 'Carpentry, Snow Removal', 1700);