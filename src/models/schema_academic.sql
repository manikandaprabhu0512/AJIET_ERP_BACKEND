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

-- 4. Curriculum Schemes & Subjects
CREATE TABLE IF NOT EXISTS curriculum_schemes (
  dept_code VARCHAR(10) NOT NULL,
  scheme_year CHAR(2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (dept_code, scheme_year),
  FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS curriculum_subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dept_code VARCHAR(10) NOT NULL,
  scheme_year CHAR(2) NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  subject_number TINYINT UNSIGNED NOT NULL,
  subject_code VARCHAR(20) NOT NULL,
  subject_name VARCHAR(200) NOT NULL,
  subject_category VARCHAR(40) NOT NULL,
  teaching_hours SMALLINT UNSIGNED NOT NULL,
  credits SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_curriculum_subject_sequence (dept_code, scheme_year, semester, subject_number),
  UNIQUE KEY unique_curriculum_subject_code (subject_code),
  FOREIGN KEY (dept_code, scheme_year)
    REFERENCES curriculum_schemes(dept_code, scheme_year) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS curriculum_subject_allotments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dept_code VARCHAR(10) NOT NULL,
  curriculum_subject_id INT NOT NULL,
  faculty_id VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  section VARCHAR(20) NOT NULL DEFAULT 'Section A',
  allocated_by VARCHAR(20) DEFAULT 'HOD_EC',
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_curriculum_allotment (dept_code, curriculum_subject_id, faculty_id, academic_year, section),
  FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE,
  FOREIGN KEY (curriculum_subject_id) REFERENCES curriculum_subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faculty_attendance_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  faculty_id VARCHAR(50) NOT NULL,
  usn VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  section VARCHAR(30) NOT NULL,
  subject_code VARCHAR(30) NOT NULL,
  subject_name VARCHAR(200) NOT NULL DEFAULT '',
  attendance_date DATE NOT NULL,
  period TINYINT UNSIGNED NOT NULL,
  status CHAR(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_faculty_attendance_session
    (usn, academic_year, semester, section, subject_code, attendance_date, period),
  INDEX idx_faculty_attendance_student (usn, semester, academic_year),
  INDEX idx_faculty_attendance_subject
    (academic_year, semester, section, subject_code, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faculty_ia_marks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  faculty_id VARCHAR(50) NOT NULL,
  usn VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  section VARCHAR(30) NOT NULL,
  subject_code VARCHAR(30) NOT NULL,
  subject_name VARCHAR(200) NOT NULL DEFAULT '',
  ia1 DECIMAL(5,2) DEFAULT NULL,
  ia2 DECIMAL(5,2) DEFAULT NULL,
  task1 DECIMAL(5,2) DEFAULT NULL,
  task2 DECIMAL(5,2) DEFAULT NULL,
  final_ia DECIMAL(5,2) DEFAULT NULL,
  source VARCHAR(30) NOT NULL DEFAULT 'Manual Entry',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_faculty_ia_student_subject
    (usn, academic_year, semester, section, subject_code),
  INDEX idx_faculty_ia_student (usn, semester, academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Legacy Subject Allocations (HOD Mapping)
CREATE TABLE IF NOT EXISTS subject_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dept_code VARCHAR(10) NOT NULL,
  semester INT NOT NULL,
  section VARCHAR(20) NOT NULL DEFAULT 'Section A',
  subject_code VARCHAR(20) NOT NULL,
  faculty_id VARCHAR(20) NOT NULL,
  academic_year VARCHAR(20) NOT NULL DEFAULT '2026-27',
  allocated_by VARCHAR(20) DEFAULT 'HOD_EC',
  teaching_hours INT NOT NULL DEFAULT 0,
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE,
  FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE,
  UNIQUE KEY unique_subject_faculty_year (dept_code, semester, section, subject_code, faculty_id, academic_year)
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
