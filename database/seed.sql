-- Sample data for development
-- This file should be run after Prisma migrations

-- Users (passwords are hashed versions of 'password123!')
INSERT INTO "users" (id, email, password, "firstName", "lastName", phone, "isActive", "twoFactorEnabled", "createdAt", "updatedAt") VALUES
('user1_cuid', 'john.doe@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewohyb4MPIbBYP.O', 'John', 'Doe', '+1234567890', true, false, NOW(), NOW()),
('user2_cuid', 'jane.smith@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewohyb4MPIbBYP.O', 'Jane', 'Smith', '+1987654321', true, true, NOW(), NOW()),
('user3_cuid', 'mike.johnson@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewohyb4MPIbBYP.O', 'Mike', 'Johnson', '+1555666777', true, false, NOW(), NOW());

-- Projects
INSERT INTO "projects" (id, name, description, status, "userId", "createdAt", "updatedAt") VALUES
('proj1_cuid', 'Website Redesign', 'Complete redesign of the company website with modern UI/UX', 'ACTIVE', 'user1_cuid', NOW(), NOW()),
('proj2_cuid', 'Mobile App Development', 'Native mobile app for iOS and Android platforms', 'ACTIVE', 'user1_cuid', NOW(), NOW()),
('proj3_cuid', 'Database Migration', 'Migrate legacy database to PostgreSQL', 'COMPLETED', 'user1_cuid', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
('proj4_cuid', 'E-commerce Platform', 'Full-featured e-commerce solution with payment integration', 'ACTIVE', 'user2_cuid', NOW(), NOW()),
('proj5_cuid', 'API Documentation', 'Comprehensive API documentation and developer portal', 'PAUSED', 'user2_cuid', NOW() - INTERVAL '15 days', NOW() - INTERVAL '7 days'),
('proj6_cuid', 'Security Audit', 'Complete security assessment and vulnerability testing', 'ACTIVE', 'user3_cuid', NOW(), NOW());

-- Project Details
INSERT INTO "project_details" (id, "firstName", "lastName", birthday, street, "houseNumber", "zipCode", city, country, "projectId", "createdAt", "updatedAt") VALUES
('details1_cuid', 'Alice', 'Williams', '1985-03-15', 'Main Street', '123', '12345', 'New York', 'United States', 'proj1_cuid', NOW(), NOW()),
('details2_cuid', 'Bob', 'Anderson', '1990-07-22', 'Oak Avenue', '456', '67890', 'Los Angeles', 'United States', 'proj2_cuid', NOW(), NOW()),
('details3_cuid', 'Carol', 'Brown', '1988-11-08', 'Pine Road', '789', '54321', 'Chicago', 'United States', 'proj3_cuid', NOW(), NOW()),
('details4_cuid', 'David', 'Davis', '1992-05-30', 'Elm Street', '321', '98765', 'Houston', 'United States', 'proj4_cuid', NOW(), NOW()),
('details5_cuid', 'Emma', 'Wilson', '1987-09-12', 'Maple Drive', '654', '13579', 'Phoenix', 'United States', 'proj5_cuid', NOW(), NOW()),
('details6_cuid', 'Frank', 'Miller', '1991-12-25', 'Cedar Lane', '987', '24680', 'Philadelphia', 'United States', 'proj6_cuid', NOW(), NOW());

-- Sessions (these will be short-lived in production)
INSERT INTO "sessions" (id, "userId", token, "expiresAt", "createdAt") VALUES
('session1_cuid', 'user1_cuid', 'dev_token_john_doe_12345', NOW() + INTERVAL '7 days', NOW()),
('session2_cuid', 'user2_cuid', 'dev_token_jane_smith_67890', NOW() + INTERVAL '7 days', NOW()),
('session3_cuid', 'user3_cuid', 'dev_token_mike_johnson_54321', NOW() + INTERVAL '7 days', NOW());