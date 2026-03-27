-- ============================================
-- Thekedaar Management System - MySQL Setup
-- ============================================
-- Run this script to create the database:
--   mysql -u root -p < db-setup.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS thekedaar_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE thekedaar_db;

-- Tables are auto-created by Prisma migrations.
-- To set up tables, run:  npx prisma db push
-- To view data, run:      npx prisma studio

-- ============================================
-- Optional: Create a dedicated app user
-- ============================================
-- CREATE USER 'thekedaar_user'@'localhost' IDENTIFIED BY 'YourSecurePassword';
-- GRANT ALL PRIVILEGES ON thekedaar_db.* TO 'thekedaar_user'@'localhost';
-- FLUSH PRIVILEGES;
