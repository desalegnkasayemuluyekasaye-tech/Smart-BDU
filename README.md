<div align="center">
  <h1>SmartBDU — Smart Campus Web Application 🎓</h1>
  <p>A comprehensive full-stack platform built for Bahir Dar University to modernize campus management and student interaction.</p>
  
  [![React](https://img.shields.io/badge/React-18.2-blue.svg?style=flat&logo=react)](https://reactjs.org)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-success.svg?style=flat&logo=nodedotjs)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Native-green.svg?style=flat&logo=mongodb)](#)
  [![Hugging Face](https://img.shields.io/badge/AI-Hugging_Face-yellow.svg?style=flat&logo=huggingface)](#)
</div>

<br />

> SmartBDU is a **MERN-stack** application that provides a unified digital interface for university students, faculty, and administrators. It empowers users to access personalized class schedules, course materials, cafeteria menus, and intelligent AI assistance—all tailored for the Bahir Dar University ecosystem.

## 📑 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [User Roles & Permissions](#-user-roles--permissions)
- [Getting Started](#-getting-started)
- [Scripts & Commands](#-scripts--commands)
- [API Reference](#-api-reference)
- [Security](#-security)

---

## ✨ Features

### 👨‍🎓 Student Experience

- **Interactive Dashboard:** Get a personalized daily rundown complete with active schedules, priority announcements, and pending assignments.
- **Academic Hub:** Keep track of your Registered Courses, view detailed reading materials, and stay on top of deadlines.
- **Campus Services:** Quickly view Cafeteria menus, Dormitory allocations, and Bus/Transport scheduling around the university.
- **Smart Directory:** Find contact information for your peers or faculty instantly.
- **AI Academic Assistant:** Chat with an integrated Hugging Face AI (BlenderBot) tailored to answer university-related academic logic.

### 🛡️ Administrative Control (Admin Dashboard)

- **Comprehensive User Management:** Securely create and delete student and faculty accounts.
- **Course Administration:** Add new courses with associated credits, codes, and departments.
- **System-Wide Announcements:** Push urgent, academic, or general announcements to the whole campus with customized priority tagging.

---

## 🏗 Architecture & Tech Stack

The application strictly follows the MERN architectural path, ensuring an organized separation of concerns and robust data delivery.

| **Layer**          | **Technology Used**                                           |
| :----------------- | :------------------------------------------------------------ |
| **Frontend**       | React 18, React Router v6, Context API                        |
| **Styling**        | Custom Vanilla CSS3 (Interactive Data Tables, Badges, Modals) |
| **Backend**        | Node.js, Express.js                                           |
| **Database**       | MongoDB, Mongoose ODM                                         |
| **Authentication** | JSON Web Tokens (JWT) & bcrypt                                |
| **AI Integration** | Hugging Face Inference API                                    |

```text
smartBDU/
├── frontend/                # React SPA
│   ├── public/
│   └── src/
│       ├── components/      # Common UI components (Sidebar/Layout)
│       ├── pages/           # Admin Dashboard, Login, Schedule, etc.
│       ├── context/         # AuthContext implementation
│       └── services/        # Centralized HTTP request utility (api.js)
│
└── backend/                 # Node/Express REST API
    ├── config/              # MongoDB connection
    ├── controllers/         # Mongoose querying logic
    ├── middleware/          # JWT Verification & Role authorization
    ├── models/              # Schemas (User, Course, Announcement...)
    └── routes/              # Express Router definitions
```

---

## 🔐 User Roles & Permissions

SmartBDU utilizes strict Role-Based Access Control (RBAC).

| Role         | Permissions                                                                                                            |
| :----------- | :--------------------------------------------------------------------------------------------------------------------- |
| 🧑‍🎓 `student` | Read-only access to schedules, courses, announcements. Can chat with the AI.                                           |
| 👨‍🏫 `faculty` | Manage and update their assigned courses, upload materials.                                                            |
| 👑 `admin`   | Full system access. Create/Delete users, issue major announcements, and establish courses via the **Admin Dashboard**. |

### Default Test Accounts:

- **Admin:** `admin@bdu.edu.et` / `admin123`
- **Faculty:** `sarah.johnson@bdu.edu.et` / `faculty123`
- **Student:** `abebe.kebede@bdu.edu.et` / `student123`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+)
- Local **MongoDB** server, or a valid **MongoDB Atlas** URI.

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd smartBDU

# Install dependencies for both layers
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory and populate it:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/smartbdu
JWT_SECRET=super_secret_jwt_key_here
JWT_EXPIRES_IN=30d
HUGGING_FACE_API_KEY=your_huggingface_sdk_key
```

### 3. Setup the Database

<<<<<<< HEAD

```bash
# Start both frontend and backend concurrently
npm run dev
```

The application runs on:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000

### Seeding Sample Data

=======
Pre-populate the database with users, mock courses, and announcements:

> > > > > > > 45e060a04121bc2c83da91d79bd0595a714072e2

```bash
cd backend
npm run seed
```

### 4. Running the App

<<<<<<< HEAD

## API Reference

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| POST   | `/auth/register` | Register a new user         |
| POST   | `/auth/login`    | Login (email or student ID) |
| GET    | `/auth/profile`  | Get current user profile    |
| PUT    | `/auth/profile`  | Update user profile         |

### Data Endpoints

| Method | Endpoint             | Description                                                 |
| ------ | -------------------- | ----------------------------------------------------------- |
| GET    | `/announcements`     | List announcements (supports `?priority=&category=&limit=`) |
| GET    | `/announcements/:id` | Get single announcement                                     |
| GET    | `/schedule`          | List schedules (supports `?day=&department=&year=`)         |
| GET    | `/schedule/:id`      | Get single schedule                                         |
| GET    | `/courses`           | List courses                                                |
| GET    | `/courses/:id`       | Get course details                                          |
| GET    | `/assignments`       | List assignments                                            |
| GET    | `/services`          | List campus services                                        |
| GET    | `/directory`         | List directory contacts                                     |

### AI Assistant

| Method | Endpoint      | Description               |
| ------ | ------------- | ------------------------- |
| POST   | `/ai/chat`    | Chat with AI assistant    |
| POST   | `/ai/roadmap` | Generate learning roadmap |
| POST   | `/ai/cv`      | Generate professional CV  |

### File Upload (Faculty Only)

| Method | Endpoint              | Description               |
| ------ | --------------------- | ------------------------- |
| POST   | `/files/upload`       | Upload teaching materials |
| GET    | `/files`              | List all uploaded files   |
| GET    | `/files/my-files`     | List my uploaded files    |
| GET    | `/files/download/:id` | Download a file           |
| DELETE | `/files/:id`          | Delete a file             |

### Admin Endpoints

| Method | Endpoint                  | Description     |
| ------ | ------------------------- | --------------- |
| POST   | `/auth/admin/create-user` | Create new user |
| GET    | `/auth/admin/users`       | List all users  |
| DELETE | `/auth/admin/users/:id`   | Delete a user   |

**Request Body:**

```json
{
  "message": "What courses should I take for Data Science?",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help you?" }
  ]
}
```

### Health Check

| Method | Endpoint  | Description       |
| ------ | --------- | ----------------- |
| GET    | `/health` | API health status |

---

## Application Flow

```
Home Page
    │
    ├── Select Campus
    │       │
    │       ├── Login
    │       │       │
    │       │       └── Student Dashboard (Protected)
    │       │                   │
    │       │                   ├── /app (Dashboard)
    │       │                   ├── /app/schedule
    │       │                   ├── /app/announcements
    │       │                   ├── /app/courses
    │       │                   ├── /app/services
    │       │                   ├── /app/directory
    │       │                   └── /app/ai-assistant
    │       │
    │       └── Register (New User)
    │
    └── Landing Page Content
```

---

## User Roles

| Role      | Permissions                                  |
| --------- | -------------------------------------------- |
| `student` | Access all features, view personal dashboard |
| `faculty` | Manage courses, post announcements           |
| `admin`   | Full system access, user management          |

---

## Test Accounts

| Role    | Email                      | Password    |
| ------- | -------------------------- | ----------- |
| Admin   | admin@bdu.edu.et           | admin123    |
| Faculty | solomon.tadesse@bdu.edu.et | lecturer123 |
| Student | abebe.kebede@bdu.edu.et    | student123  |

---

## Available Scripts

### Root Level

=======
You can boot both servers concurrently from their respective directories:

> > > > > > > 45e060a04121bc2c83da91d79bd0595a714072e2

```bash
# Terminal 1 - Backend Server
cd backend
npm run dev

# Terminal 2 - Frontend Application
cd frontend
npm start
```

- **Live Frontend:** http://localhost:3000
- **Live Backend:** http://localhost:4000

---

## 🔌 API Reference

SmartBDU exposes a robust standard REST API.

| Endpoint                    |  Method  |       Role        | Action                            |
| --------------------------- | :------: | :---------------: | --------------------------------- |
| `/api/auth/login`           |  `POST`  |     _Public_      | Authenticate a user               |
| `/api/auth/admin/users`     |  `GET`   |      `admin`      | Retrieve all platform users       |
| `/api/auth/admin/users/:id` | `DELETE` |      `admin`      | Erase a specific user             |
| `/api/courses`              |  `GET`   |     _Public_      | Lookup available active courses   |
| `/api/courses`              |  `POST`  |      `admin`      | Generate a new curriculum course  |
| `/api/announcements`        |  `POST`  |      `admin`      | Post a site-wide broadcast        |
| `/api/ai/chat`              |  `POST`  | `student/faculty` | Interact with the Hugging Face AI |

> _Note: Protected endpoints require an `Authorization: Bearer <token>` header._

---

## 🛡 Security

- Passwords never stored in plain text (bcrypt w/ 10 salt rounds).
- Stateful tokens processed via `authMiddleware` to block unauthorized requests dynamically.
- Graceful API drop for unauthenticated attempts preventing request hanging (`ERR_HTTP_HEADERS_SENT` managed).

---

<div align="center">
  <b>Built for Bahir Dar University - Smart Campus Initiative</b><br/>
</div>
