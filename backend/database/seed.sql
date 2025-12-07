-- Seed data for Maatram KK Database
-- This file contains initial data to populate the database

-- Note: Passwords are hashed using bcrypt
-- Default passwords:
-- admin@maatram.org: admin@123
-- lead@maatram.org: lead@123
-- tutor@maatram.org: tutor@123
-- coord@maatram.org: coord@123

-- Insert users (passwords are bcrypt hashed)
-- You'll need to generate these hashes using bcrypt in your application
-- For now, these are placeholder hashes - replace with actual bcrypt hashes
INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES
    (uuid_generate_v4(), 'Akila Admin', 'admin@maatram.org', '$2a$10$placeholder_hash_replace_with_bcrypt', 'admin', 'https://ui-avatars.com/api/?name=Akila+Admin'),
    (uuid_generate_v4(), 'Latha Lead', 'lead@maatram.org', '$2a$10$placeholder_hash_replace_with_bcrypt', 'tutorLead', 'https://ui-avatars.com/api/?name=Latha+Lead'),
    (uuid_generate_v4(), 'Siva Tutor', 'tutor@maatram.org', '$2a$10$placeholder_hash_replace_with_bcrypt', 'tutor', 'https://ui-avatars.com/api/?name=Siva+Tutor'),
    (uuid_generate_v4(), 'Priya Coordinator', 'coord@maatram.org', '$2a$10$placeholder_hash_replace_with_bcrypt', 'coordinator', 'https://ui-avatars.com/api/?name=Priya+Coord')
ON CONFLICT (email) DO NOTHING;

-- Note: After inserting users, you'll need to:
-- 1. Get the tutor user's ID
-- 2. Insert into tutors table with that user_id
-- 3. Insert students, classes, etc.

-- Example tutor insertion (replace user_id with actual UUID from users table)
-- INSERT INTO tutors (user_id, name, email, phone_encrypted, status, subjects, avg_attendance)
-- SELECT id, name, email, 'encrypted_phone_here', 'active', '["Math", "Science"]'::jsonb, 92
-- FROM users WHERE email = 'tutor@maatram.org';

-- Example student insertion
-- INSERT INTO students (name, phase, guardian_contact_encrypted, group, progress_score) VALUES
--     ('Mani K', 'Selection', 'encrypted_contact_here', 'KK-2025-A', 78),
--     ('Harini D', 'Scheduling', 'encrypted_contact_here', 'KK-2025-B', 84),
--    ('Kumar S', 'Attendance', 'encrypted_contact_here', 'KK-2025-C', 66);

