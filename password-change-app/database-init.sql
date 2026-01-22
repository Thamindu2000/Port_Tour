-- Create database
CREATE DATABASE IF NOT EXISTS password_change_app;

-- Use the database
USE password_change_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Insert sample data
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$example.hash.for.admin', 'admin'),
('superadmin', '$2a$10$example.hash.for.superadmin', 'superadmin'),
('user', '$2a$10$example.hash.for.user', 'user')
ON DUPLICATE KEY UPDATE username=username;
