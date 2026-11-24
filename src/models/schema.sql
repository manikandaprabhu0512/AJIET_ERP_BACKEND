-- =========================================================
-- AJIET ERP — MySQL Database Schema
-- =========================================================

CREATE DATABASE IF NOT EXISTS ajiet_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ajiet_erp;

-- 1. Users Table (Core Auth for All Roles: Student, Faculty, Admin, etc.)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,       -- USN for students, Employee ID for staff
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student', -- 'student', 'faculty', 'admin', 'hod', etc.
  is_first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Student Profiles Table (Matches AJIET Registration Form Fields)
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  usn VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(120) NOT NULL,
  mobile_country_code VARCHAR(10) DEFAULT '+91',
  mobile VARCHAR(20) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  section VARCHAR(20) DEFAULT 'Section A',
  enrolled_year VARCHAR(10) DEFAULT '2026',
  program_type VARCHAR(20) DEFAULT 'UG',
  admission_quota VARCHAR(50) DEFAULT 'CET',
  dob DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  religion VARCHAR(50),
  caste VARCHAR(50),
  category VARCHAR(50),
  aadhaar_number VARCHAR(20),
  place_of_stay VARCHAR(50),
  student_ssid VARCHAR(50),
  sslc_percentage DECIMAL(5,2),
  studied_kannada_in_sslc VARCHAR(10) DEFAULT 'Yes',
  puc_pcm_percentage DECIMAL(5,2),
  puc_total_percentage DECIMAL(5,2),
  address_line1 TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Karnataka',
  pincode VARCHAR(20),
  pg_owner_name VARCHAR(100),
  pg_contact_country_code VARCHAR(10) DEFAULT '+91',
  pg_contact_number VARCHAR(20),
  pg_address TEXT,
  father_name VARCHAR(150),
  father_occupation VARCHAR(100),
  father_mobile_country_code VARCHAR(10) DEFAULT '+91',
  father_mobile VARCHAR(20),
  mother_name VARCHAR(150),
  mother_occupation VARCHAR(100),
  mother_mobile_country_code VARCHAR(10) DEFAULT '+91',
  mother_mobile VARCHAR(20),
  declaration_accepted BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_profiles_usn (usn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
