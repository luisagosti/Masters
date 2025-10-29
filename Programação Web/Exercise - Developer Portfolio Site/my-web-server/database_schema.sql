-- ============================================
-- Portfolio Database Schema
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- ============================================
-- Table: users (for authentication)
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'guest', 'user') DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- ============================================
-- Table: projects (portfolio projects)
-- ============================================
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    year VARCHAR(4) NOT NULL,
    role VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    link VARCHAR(255) DEFAULT '#',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_active (is_active)
);

-- ============================================
-- Table: technologies (tech stack)
-- ============================================
CREATE TABLE technologies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category ENUM('language', 'framework', 'database', 'tool', 'other') DEFAULT 'other',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: project_technologies (many-to-many)
-- ============================================
CREATE TABLE project_technologies (
    project_id INT NOT NULL,
    technology_id INT NOT NULL,
    PRIMARY KEY (project_id, technology_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE
);

-- ============================================
-- Table: experiences (work experience)
-- ============================================
CREATE TABLE experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    start_date VARCHAR(20) NOT NULL,
    end_date VARCHAR(20) NULL,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- Table: skills (skills and competencies)
-- ============================================
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    proficiency ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: contact_messages (optional - for contact form)
-- ============================================
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- POPULATE DATABASE WITH SAMPLE DATA
-- ============================================

-- Insert Users (passwords are hashed: admin123 and guest123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@portfolio.com', '$2a$10$rJ4SXqKvXWJY5pXq5Y5qJu5Xq5Y5qJu5Xq5Y5qJu5Xq5Y5qJu5Xq5.', 'admin'),
('Guest User', 'guest@portfolio.com', '$2a$10$rJ4SXqKvXWJY5pXq5Y5qJu5Xq5Y5qJu5Xq5Y5qJu5Xq5Y5qJu5Xq5.', 'guest'),
('Luis Agostinho', 'llagostinho01@gmail.com', '$2a$10$rJ4SXqKvXWJY5pXq5Y5qJu5Xq5Y5qJu5Xq5Y5qJu5Xq5Y5qJu5Xq5.', 'admin');

-- Insert Technologies
INSERT INTO technologies (name, category) VALUES
('Python', 'language'),
('JavaScript', 'language'),
('C', 'language'),
('C#', 'language'),
('HTML/CSS', 'language'),
('React', 'framework'),
('Node.js', 'framework'),
('Express', 'framework'),
('TensorFlow', 'framework'),
('ASP.NET', 'framework'),
('MySQL', 'database'),
('SQL Server', 'database'),
('MongoDB', 'database'),
('Firebase', 'database'),
('Docker', 'tool'),
('Azure', 'tool'),
('Scikit-learn', 'framework'),
('Linux', 'tool'),
('Windows Server', 'tool');

-- Insert Projects
INSERT INTO projects (title, year, role, description, link, display_order) VALUES
('AI-Powered Malware Detection System', 
 '2024', 
 'ML Engineer & Security Researcher',
 'Developed a machine learning system using TensorFlow to detect and classify malware with 95% accuracy. Implemented feature extraction from binary files and trained models on a dataset of 100,000+ samples.',
 '#',
 1),

('Secure Interbank Communication Platform',
 '2023',
 'Cybersecurity Engineer',
 'Built a secure messaging system for Bank of Portugal enabling encrypted communication between financial institutions. Implemented end-to-end encryption and multi-factor authentication.',
 '#',
 2),

('Network Security Monitoring Dashboard',
 '2022',
 'Full-Stack Developer',
 'Created a real-time network monitoring solution with threat detection capabilities. Features include packet analysis, anomaly detection, and automated alert systems.',
 '#',
 3);

-- Link Technologies to Projects
-- Project 1: AI-Powered Malware Detection
INSERT INTO project_technologies (project_id, technology_id) VALUES
(1, 1),  -- Python
(1, 9),  -- TensorFlow
(1, 17), -- Scikit-learn
(1, 15); -- Docker

-- Project 2: Secure Interbank Communication
INSERT INTO project_technologies (project_id, technology_id) VALUES
(2, 4),  -- C#
(2, 10), -- ASP.NET
(2, 12), -- SQL Server
(2, 16); -- Azure

-- Project 3: Network Security Monitoring
INSERT INTO project_technologies (project_id, technology_id) VALUES
(3, 6),  -- React
(3, 7),  -- Node.js
(3, 1),  -- Python
(3, 13); -- MongoDB

-- Insert Work Experiences
INSERT INTO experiences (title, company, start_date, end_date, is_current, display_order) VALUES
('Web Developer', 'Freelance', '2022', '2025', TRUE, 1),
('Cybersecurity Specialist', 'Bank of Portugal', '2022', '2022', FALSE, 2),
('Software Developer', 'Real Life Technologies', '2021', '2021', FALSE, 3),
('IT Engineer Associate', 'Microcapital', '2019', '2025', TRUE, 4);

-- Insert Skills
INSERT INTO skills (name, category, proficiency, display_order) VALUES
('Python', 'Programming Languages', 'expert', 1),
('C', 'Programming Languages', 'advanced', 2),
('JavaScript', 'Programming Languages', 'advanced', 3),
('Machine Learning', 'AI & ML', 'expert', 4),
('TensorFlow', 'AI & ML', 'advanced', 5),
('Cybersecurity', 'Security', 'expert', 6),
('Penetration Testing', 'Security', 'advanced', 7),
('Network Security', 'Security', 'advanced', 8),
('SQL', 'Databases', 'advanced', 9),
('MySQL', 'Databases', 'advanced', 10),
('Linux Administration', 'Systems', 'advanced', 11),
('Docker', 'DevOps', 'intermediate', 12);