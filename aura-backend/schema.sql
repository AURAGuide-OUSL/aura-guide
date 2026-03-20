-- CATEGORY
CREATE TABLE category (
   id SERIAL PRIMARY KEY,
   name VARCHAR(255)
);

-- SKILLS
CREATE TABLE skills (
   id SERIAL PRIMARY KEY,
   name VARCHAR(255),
   category_id INT REFERENCES category(id)
);

-- SKILL MATRIX LEVELS
CREATE TABLE skill_matrix_levels (
   score_id INT PRIMARY KEY,
   level VARCHAR(100)
);

-- SKILL MATRIX
CREATE TABLE skill_matrix (
   id SERIAL,
   score_id INT,
   skill_id INT,
   evaluation_criteria TEXT,
   PRIMARY KEY (id, score_id),
   FOREIGN KEY (score_id) REFERENCES skill_matrix_levels(score_id),
   FOREIGN KEY (skill_id) REFERENCES skills(id)
);

-- GOALS
CREATE TABLE goals (
   id SERIAL PRIMARY KEY,
   name VARCHAR(255)
);

-- USER STUDENT
CREATE TABLE user_student (
   id SERIAL PRIMARY KEY,
   goal_id INT REFERENCES goals(id),
   email VARCHAR(255) UNIQUE,
   password_hash TEXT,
   first_name VARCHAR(100),
   last_name VARCHAR(100),
   degree_program VARCHAR(255),
   study_year INT,
   university VARCHAR(255),
   current_score INT DEFAULT 0,
   recommendation TEXT
);

-- USER SKILLS
CREATE TABLE user_skills (
   id SERIAL PRIMARY KEY,
   user_id INT REFERENCES user_student(id),
   skill_id INT REFERENCES skills(id),
   score_id INT
);

-- GOAL SKILL MATRIX
CREATE TABLE goal_skill_matrix (
   id SERIAL PRIMARY KEY,
   goal_id INT REFERENCES goals(id),
   skill_id INT REFERENCES skills(id),
   score_id INT
);

-- STATUS
CREATE TABLE status (
   id SERIAL PRIMARY KEY,
   name VARCHAR(100)
);

-- COMMON TASKS
CREATE TABLE common_tasks (
   id SERIAL PRIMARY KEY,
   skill_id INT REFERENCES skills(id),
   task TEXT
);

-- USER COMMON TASKS
CREATE TABLE user_common_tasks (
   id SERIAL PRIMARY KEY,
   user_id INT REFERENCES user_student(id),
   common_task_id INT REFERENCES common_tasks(id),
   start_date_time TIMESTAMP,
   end_date_time TIMESTAMP,
   status_id INT REFERENCES status(id)
);

-- USER CUSTOM TASKS
CREATE TABLE user_custom_tasks (
   id SERIAL PRIMARY KEY,
   skill_id INT REFERENCES skills(id),
   user_id INT REFERENCES user_student(id),
   task TEXT,
   start_date_time TIMESTAMP,
   end_date_time TIMESTAMP,
   status_id INT REFERENCES status(id)
);

-- BADGE
CREATE TABLE badge (
   id SERIAL PRIMARY KEY,
   name VARCHAR(255),
   criteria TEXT
);

-- USER BADGE
CREATE TABLE user_badge (
   id SERIAL PRIMARY KEY,
   user_id INT REFERENCES user_student(id),
   badge_id INT REFERENCES badge(id),
   issued_date_time TIMESTAMP
);

-- CHAT SESSIONS
CREATE TABLE chat_sessions (
   id SERIAL PRIMARY KEY,
   user_id INT REFERENCES user_student(id),
   topic VARCHAR(255),
   start_date_time TIMESTAMP
);

-- CHAT MESSAGE
CREATE TABLE chat_message (
   id SERIAL PRIMARY KEY,
   session_id INT REFERENCES chat_sessions(id),
   message TEXT,
   is_sender_user BOOLEAN
);

-- USER STREAK
CREATE TABLE user_streak (
   id SERIAL PRIMARY KEY,
   user_id INT REFERENCES user_student(id),
   number_of_days INT,
   last_updated TIMESTAMP
);

-- USER NOTIFICATION
CREATE TABLE user_notification (
   id SERIAL PRIMARY KEY,
   user_id INT REFERENCES user_student(id),
   message TEXT,
   send_date_time TIMESTAMP,
   is_read BOOLEAN
);

-- SEED DATA
INSERT INTO status (name) VALUES ('pending'), ('in_progress'), ('completed'), ('abandoned');

INSERT INTO category (name) VALUES ('Technical'), ('Soft Skills'), ('Academic');

INSERT INTO goals (name) VALUES ('Software Engineer'), ('Backend Developer'), ('QA Engineer');
