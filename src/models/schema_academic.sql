-- =========================================================
-- AJIET ERP — Department, Faculty & Subject Allocation Schema
-- =========================================================

USE ajiet_erp;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  dept_code VARCHAR(10) PRIMARY KEY,
  dept_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Faculty & HOD Table
CREATE TABLE IF NOT EXISTS faculty (
  faculty_id VARCHAR(20) PRIMARY KEY, -- e.g. 'HOD_EC', 'EC001'
  name VARCHAR(150) NOT NULL,
  dept_code VARCHAR(10) NOT NULL,
  designation VARCHAR(100) NOT NULL,  -- 'Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor'
  email VARCHAR(120) UNIQUE NOT NULL,
  mobile VARCHAR(20) DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  is_hod BOOLEAN DEFAULT FALSE,
  is_first_login BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE,
  INDEX idx_faculty_dept (dept_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(200) NOT NULL,
  dept_code VARCHAR(10) NOT NULL,
  semester INT NOT NULL,              -- 3 or 4
  credits INT NOT NULL DEFAULT 3,
  subject_type VARCHAR(50) DEFAULT 'Theory', -- 'Theory', 'Theory + Lab', 'Mandatory'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE,
  INDEX idx_subjects_dept_sem (dept_code, semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Subject Allocations (HOD Mapping)
CREATE TABLE IF NOT EXISTS subject_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dept_code VARCHAR(10) NOT NULL,
  semester INT NOT NULL,
  section VARCHAR(20) NOT NULL DEFAULT 'Section A',
  subject_code VARCHAR(20) NOT NULL,
  faculty_id VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL DEFAULT '2026-27',
  allocated_by VARCHAR(20) DEFAULT 'HOD_EC',
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE,
  FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
  UNIQUE KEY unique_allocation (dept_code, semester, section, subject_code, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Faculty Messages / Student Notifications
CREATE TABLE IF NOT EXISTS faculty_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id VARCHAR(50) NOT NULL,
  faculty_name VARCHAR(150) DEFAULT '',
  department VARCHAR(150) DEFAULT '',
  subject VARCHAR(200) DEFAULT '',
  body TEXT NOT NULL,
  recipient_usn VARCHAR(20) DEFAULT NULL,
  recipient_mode VARCHAR(20) NOT NULL DEFAULT 'all',
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_faculty_messages_faculty (faculty_id),
  INDEX idx_faculty_messages_recipient (recipient_usn),
  INDEX idx_faculty_messages_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faculty_message_reads (
  message_id INT NOT NULL,
  usn VARCHAR(20) NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, usn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
