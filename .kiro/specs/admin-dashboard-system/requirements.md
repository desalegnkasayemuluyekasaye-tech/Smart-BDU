# Requirements Document

## Introduction

The Admin Dashboard System is a production-ready feature for the SmartBDU University Web Application. It provides administrators with full control over user management (students and teachers), course management, teacher-course assignments, and targeted announcements. The system enforces strict role-based access control (RBAC) so that teachers can only interact with courses they are explicitly assigned to, and students can only access content relevant to their department, batch, and section. The feature is built on top of the existing React.js frontend, Node.js/Express.js backend, and MongoDB database.

## Glossary

- **Admin_Dashboard**: The React frontend interface providing sidebar navigation and management pages for the admin role.
- **Admin**: A user with `role: "admin"` who has full control over the system.
- **Teacher**: A user with `role: "lecturer"` who can only access and act on courses assigned by the admin.
- **Student**: A user with `role: "student"` who can view announcements, courses, and materials relevant to their profile.
- **Auth_Service**: The backend Express.js authentication service handling login, JWT issuance, and profile updates.
- **Admin_Controller**: The backend Express.js controller handling all admin-only operations (add users, create courses, assign teachers, post announcements).
- **Teacher_Controller**: The backend Express.js controller handling teacher-scoped operations (upload materials, post announcements to assigned classes).
- **Student_Controller**: The backend Express.js controller handling student-scoped data retrieval.
- **RBAC_Middleware**: The Express.js middleware that validates JWT tokens and enforces role-based route access.
- **Course**: A MongoDB document with courseName, courseCode, department, and an array of assignedTeachers (User ObjectIds).
- **Announcement**: A MongoDB document with title, message, targetType, optional department/batch/section filters, and createdBy reference.
- **Material**: A MongoDB document (file) with fileUrl, courseId, and uploadedBy reference.
- **JWT**: JSON Web Token used for stateless authentication.
- **Batch**: The enrollment year of a student (e.g., 2022, 2023).
- **Section**: A subdivision of a class within a department and batch (e.g., "A", "B").
- **Initial_Password**: The auto-generated password set to the user's Student ID or Teacher ID at account creation time, hashed with bcrypt before storage.

---

## Requirements

### Requirement 1: Admin User Management — Add Students

**User Story:** As an admin, I want to add student accounts with all required profile fields, so that students can log in and access the system with their initial credentials.

#### Acceptance Criteria

1. WHEN the admin submits the Add Student form with valid fields (full name, Student ID, email, department, batch/year, class/section), THE Admin_Controller SHALL create a new User document with `role: "student"` and an Initial_Password equal to the Student ID, hashed with bcrypt.
2. IF the submitted email or Student ID already exists in the database, THEN THE Admin_Controller SHALL return an HTTP 400 response with a descriptive error message.
3. THE Admin_Dashboard SHALL display a confirmation message showing the new student's name, Student ID, and initial password immediately after successful creation.
4. IF any required field (full name, Student ID, email, department, batch) is missing from the submission, THEN THE Admin_Controller SHALL return an HTTP 400 response listing the missing fields.
5. THE Admin_Dashboard SHALL include a section field (class/section) in the Add Student form.

### Requirement 2: Admin User Management — Add Teachers

**User Story:** As an admin, I want to add teacher accounts with all required profile fields, so that teachers can log in and be assigned to courses.

#### Acceptance Criteria

1. WHEN the admin submits the Add Teacher form with valid fields (full name, Teacher ID, email, department), THE Admin_Controller SHALL create a new User document with `role: "lecturer"` and an Initial_Password equal to the Teacher ID, hashed with bcrypt.
2. IF the submitted email or Teacher ID already exists in the database, THEN THE Admin_Controller SHALL return an HTTP 400 response with a descriptive error message.
3. THE Admin_Dashboard SHALL display a confirmation message showing the new teacher's name, Teacher ID, and initial password immediately after successful creation.
4. IF any required field (full name, Teacher ID, email, department) is missing from the submission, THEN THE Admin_Controller SHALL return an HTTP 400 response listing the missing fields.

### Requirement 3: Admin Course Management — Create Courses

**User Story:** As an admin, I want to create courses with a name, code, and department, so that teachers can be assigned to them and students can access course materials.

#### Acceptance Criteria

1. WHEN the admin submits the Create Course form with valid fields (course name, course code, department), THE Admin_Controller SHALL create a new Course document with an empty `assignedTeachers` array.
2. IF the submitted course code already exists in the database, THEN THE Admin_Controller SHALL return an HTTP 400 response with a descriptive error message.
3. THE Admin_Dashboard SHALL display the newly created course in the course list immediately after successful creation.
4. IF any required field (course name, course code, department) is missing, THEN THE Admin_Controller SHALL return an HTTP 400 response.

### Requirement 4: Admin Course Management — Assign Teachers to Courses

**User Story:** As an admin, I want to assign one or more teachers to a course, so that only those teachers can upload materials and post announcements for that course.

#### Acceptance Criteria

1. WHEN the admin assigns a teacher to a course, THE Admin_Controller SHALL add the teacher's User ObjectId to the `assignedTeachers` array of the Course document.
2. THE Admin_Controller SHALL allow multiple teachers to be assigned to a single course.
3. WHEN a teacher is assigned to a course, THE Admin_Dashboard SHALL reflect the updated teacher list for that course without requiring a full page reload.
4. IF the specified teacher ID or course ID does not exist, THEN THE Admin_Controller SHALL return an HTTP 404 response with a descriptive error message.
5. IF a teacher is already assigned to the specified course, THEN THE Admin_Controller SHALL return an HTTP 400 response indicating the teacher is already assigned.

### Requirement 5: Teacher Access Control — Course Restriction

**User Story:** As a system enforcing RBAC, I want teachers to be restricted to only their assigned courses, so that unauthorized access to other departments or classes is prevented.

#### Acceptance Criteria

1. WHEN a teacher requests course data, THE RBAC_Middleware SHALL verify the teacher's JWT and confirm the teacher's User ObjectId is present in the course's `assignedTeachers` array before granting access.
2. IF a teacher attempts to upload materials to a course they are not assigned to, THEN THE Teacher_Controller SHALL return an HTTP 403 response with the message "Not authorized for this course".
3. IF a teacher attempts to post an announcement to a class they are not assigned to, THEN THE Teacher_Controller SHALL return an HTTP 403 response with the message "Not authorized for this class".
4. THE Teacher_Controller SHALL only return courses where the requesting teacher's User ObjectId appears in the `assignedTeachers` array.

### Requirement 6: Teacher Operations — Upload Materials

**User Story:** As a teacher, I want to upload files for my assigned classes, so that students can access course materials.

#### Acceptance Criteria

1. WHEN a teacher uploads a file for an assigned course, THE Teacher_Controller SHALL store the file and create a Material document with fileUrl, courseId, and the teacher's User ObjectId as uploadedBy.
2. IF the teacher is not assigned to the target course, THEN THE Teacher_Controller SHALL return an HTTP 403 response.
3. THE Teacher_Controller SHALL accept file types including PDF, DOC, DOCX, PPT, PPTX, ZIP, and TXT with a maximum size of 50MB.
4. IF the uploaded file exceeds 50MB, THEN THE Teacher_Controller SHALL return an HTTP 400 response with a descriptive error message.

### Requirement 7: Teacher Operations — Post Announcements

**User Story:** As a teacher, I want to post announcements to my assigned classes, so that students in those classes are notified of relevant information.

#### Acceptance Criteria

1. WHEN a teacher posts an announcement, THE Teacher_Controller SHALL verify the teacher is assigned to the target class before creating the Announcement document.
2. THE Announcement document SHALL store the teacher's User ObjectId as `createdBy` and the target class identifiers (department, batch, section).
3. IF the teacher is not assigned to the target class, THEN THE Teacher_Controller SHALL return an HTTP 403 response.
4. WHEN a teacher posts an announcement, THE Teacher_Controller SHALL set the `targetType` to "class" and populate the department, batch, and section fields accordingly.

### Requirement 8: Admin Announcement System — Targeted Announcements

**User Story:** As an admin, I want to post announcements with specific targeting options, so that the right audience receives relevant information.

#### Acceptance Criteria

1. WHEN the admin creates an announcement, THE Admin_Controller SHALL accept a `targetType` field with one of the following values: "all_students", "department", "batch", "class_section", "teachers_only".
2. WHERE `targetType` is "department", THE Admin_Controller SHALL require and store a `department` field on the Announcement document.
3. WHERE `targetType` is "batch", THE Admin_Controller SHALL require and store both `department` and `batch` fields on the Announcement document.
4. WHERE `targetType` is "class_section", THE Admin_Controller SHALL require and store `department`, `batch`, and `section` fields on the Announcement document.
5. THE Admin_Dashboard announcement form SHALL include a target type selector and conditionally display department, batch, and section fields based on the selected target type.
6. IF required targeting fields are missing for the selected `targetType`, THEN THE Admin_Controller SHALL return an HTTP 400 response listing the missing fields.

### Requirement 9: Student Access — Filtered Announcements

**User Story:** As a student, I want to see only announcements relevant to me, so that I am not overwhelmed with irrelevant information.

#### Acceptance Criteria

1. WHEN a student requests announcements, THE Student_Controller SHALL return only Announcement documents where `targetType` is "all_students", or where `targetType` is "department" and the department matches the student's department, or where `targetType` is "batch" and both department and batch match, or where `targetType` is "class_section" and department, batch, and section all match.
2. THE Student_Controller SHALL NOT return announcements with `targetType` of "teachers_only" to students.
3. WHEN a student requests announcements, THE Student_Controller SHALL return results sorted by `createdAt` in descending order.

### Requirement 10: Student Access — Courses and Materials

**User Story:** As a student, I want to view my assigned courses and access uploaded materials, so that I can study and complete coursework.

#### Acceptance Criteria

1. WHEN a student requests their courses, THE Student_Controller SHALL return Course documents matching the student's department and batch/year.
2. WHEN a student requests materials for a course, THE Student_Controller SHALL return all Material documents associated with that courseId.
3. THE Student_Controller SHALL NOT return materials from courses outside the student's enrolled courses.

### Requirement 11: Authentication — Login

**User Story:** As any user (admin, teacher, or student), I want to log in using my email and password, so that I can access the system securely.

#### Acceptance Criteria

1. WHEN a user submits valid email and password credentials, THE Auth_Service SHALL verify the password against the bcrypt hash and return a signed JWT with a 30-day expiry.
2. IF the email does not exist or the password does not match, THEN THE Auth_Service SHALL return an HTTP 401 response with the message "Invalid credentials".
3. THE Auth_Service SHALL include the user's role, name, email, department, and ID fields in the JWT payload response so the frontend can route to the correct dashboard.
4. WHILE a user is authenticated with a valid JWT, THE RBAC_Middleware SHALL attach the user document to the request object for downstream controllers.

### Requirement 12: Authentication — Profile and Password Update

**User Story:** As any authenticated user, I want to update my password, profile information, and profile photo after logging in, so that I can personalize my account.

#### Acceptance Criteria

1. WHEN an authenticated user submits a profile update request with a new password, THE Auth_Service SHALL hash the new password with bcrypt before saving it to the User document.
2. WHEN an authenticated user submits a profile update request, THE Auth_Service SHALL allow updating name, profile photo URL, and password fields.
3. IF the current password provided during a password change does not match the stored hash, THEN THE Auth_Service SHALL return an HTTP 400 response with the message "Current password is incorrect".
4. THE Auth_Service SHALL accept profile photo uploads and store the file URL in the User document's `profilePhoto` field.

### Requirement 13: Security — JWT and RBAC Middleware

**User Story:** As a system enforcing security, I want all protected routes to require a valid JWT and enforce role-based access, so that unauthorized users cannot access restricted resources.

#### Acceptance Criteria

1. THE RBAC_Middleware SHALL reject requests to protected routes that do not include a valid Bearer token in the Authorization header with an HTTP 401 response.
2. THE RBAC_Middleware SHALL reject requests to admin-only routes from users whose role is not "admin" with an HTTP 403 response.
3. THE RBAC_Middleware SHALL reject requests to teacher-only routes from users whose role is neither "lecturer" nor "admin" with an HTTP 403 response.
4. IF a JWT token has expired, THEN THE RBAC_Middleware SHALL return an HTTP 401 response with the message "Not authorized, token failed".

### Requirement 14: Admin Dashboard UI — Navigation and Layout

**User Story:** As an admin, I want a clean, modern, and fully responsive dashboard with sidebar navigation, so that I can efficiently manage all system entities.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a sidebar with navigation items for: User Management, Course Management, Teacher Assignment, and Announcement Management.
2. THE Admin_Dashboard SHALL be fully responsive and render correctly on screen widths from 320px to 1920px.
3. WHEN the admin navigates to a section via the sidebar, THE Admin_Dashboard SHALL display the corresponding management page without a full page reload.
4. THE Admin_Dashboard SHALL display the currently active sidebar item in a visually distinct highlighted state.

### Requirement 15: Database — User Schema with Section Support

**User Story:** As a system storing user data, I want the User schema to include all required fields including section, so that class-level targeting and access control work correctly.

#### Acceptance Criteria

1. THE User document SHALL include the fields: name, email, password (hashed), role, studentId (for students), teacherId (for teachers), department, batch (year), section, and profilePhoto.
2. THE User document SHALL enforce uniqueness on the email field and on the studentId field (sparse index).
3. THE User document SHALL enforce uniqueness on the teacherId field (sparse index).
4. WHEN a User document is saved with a new or modified password, THE User document pre-save hook SHALL hash the password using bcrypt with a salt factor of 10.

### Requirement 16: Database — Course Schema with Assigned Teachers

**User Story:** As a system storing course data, I want the Course schema to include an assignedTeachers array, so that teacher-course access control can be enforced.

#### Acceptance Criteria

1. THE Course document SHALL include the fields: courseName, courseCode, department, and assignedTeachers (array of User ObjectId references).
2. THE Course document SHALL enforce uniqueness on the courseCode field.
3. WHEN a teacher is assigned to a course, THE Admin_Controller SHALL push the teacher's ObjectId into the `assignedTeachers` array using an atomic MongoDB update operation.

### Requirement 17: Database — Announcement Schema with Targeting

**User Story:** As a system storing announcements, I want the Announcement schema to support all targeting fields, so that filtered delivery to the correct audience is possible.

#### Acceptance Criteria

1. THE Announcement document SHALL include the fields: title, message, targetType (enum: "all_students", "department", "batch", "class_section", "teachers_only"), department, batch, section, and createdBy (User ObjectId reference).
2. THE Announcement document SHALL store a `createdAt` timestamp automatically via Mongoose timestamps.
3. THE Announcement document SHALL index the `createdAt` field in descending order to support efficient sorted queries.
