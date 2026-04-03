# SmartBDU - Smart Campus Web Application

A comprehensive full-stack smart campus platform built for Bahir Dar University, enabling students to manage their academic activities, access campus services, and interact with an AI-powered assistant.

---

## Overview

SmartBDU is a MERN-stack application that provides a unified digital interface for university students to:
- View personalized dashboards with today's schedule and announcements
- Access course materials and track assignments
- Browse campus services (cafeteria, dormitory, transport)
- Search the faculty/student directory
- Get academic guidance from an AI assistant powered by Hugging Face

---

## Architecture

```
smartBDU/
├── frontend/                 # React 18 SPA
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components (Layout)
│   │   ├── pages/             # Route-level components
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── services/          # API client layer
│   │   └── assets/            # Images and media
│   └── package.json
├── backend/                   # Express.js REST API
│   ├── config/                # Database configuration
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth & error handling
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   └── package.json
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6 |
| Styling | CSS3 (custom) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| AI | Hugging Face Inference API (BlenderBot-400M) |
| Development | nodemon (backend), react-scripts (frontend) |

---

## Features

### Core Functionality
- **Dashboard** — Personalized overview with today's schedule, recent announcements, and pending assignments
- **Schedule Management** — View class timetables by day of the week
- **Announcements** — University and department updates with priority levels (high, medium, low)
- **Course Management** — Access course information, materials, and details
- **Assignments** — Track upcoming assignments with due dates
- **Campus Services** — Cafeteria menus, dormitory information, transport schedules
- **Directory** — Searchable contact information for students and faculty
- **AI Assistant** — Conversational AI for academic guidance using Hugging Face BlenderBot

### Authentication & Authorization
- JWT-based authentication with token validation
- Role-based access control (student, faculty, admin)
- Secure password hashing with bcrypt
- Login by email or student ID

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v6 or higher (local or Atlas)
- **npm** or yarn package manager

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd smartBDU

# 2. Install all dependencies
npm run install:all
```

### Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartbdu
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
HUGGING_FACE_API_KEY=your_huggingface_api_key
```

> **Note:** Obtain your Hugging Face API key from [huggingface.co/settings/inference](https://huggingface.co/settings/inference)

### Running the Application

```bash
# Start both frontend and backend concurrently
npm run dev
```

The application runs on:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### Seeding Sample Data

```bash
cd backend
npm run seed
```

---

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login (email or student ID) |
| GET | `/auth/profile` | Get current user profile |
| PUT | `/auth/profile` | Update user profile |

### Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/announcements` | List announcements (supports `?priority=&category=&limit=`) |
| GET | `/announcements/:id` | Get single announcement |
| GET | `/schedule` | List schedules (supports `?day=&department=&year=`) |
| GET | `/schedule/:id` | Get single schedule |
| GET | `/courses` | List courses |
| GET | `/courses/:id` | Get course details |
| GET | `/assignments` | List assignments |
| GET | `/services` | List campus services |
| GET | `/directory` | List directory contacts |

### AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Chat with AI assistant |

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

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

| Role | Permissions |
|------|-------------|
| `student` | Access all features, view personal dashboard |
| `faculty` | Manage courses, post announcements |
| `admin` | Full system access, user management |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bdu.edu.et | admin123 |
| Faculty | sarah.johnson@bdu.edu.et | faculty123 |
| Student | abebe.kebede@bdu.edu.et | student123 |

---

## Available Scripts

### Root Level

```bash
npm run dev          # Start both frontend and backend
npm run install:all  # Install dependencies for all packages
```

### Frontend (frontend/)

```bash
npm start            # Development server
npm run build        # Production build
```

### Backend (backend/)

```bash
npm start            # Production server
npm run dev         # Development server with nodemon
```

---

## Security Considerations

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens include expiration timestamps
- Protected routes verify token presence and validity
- Role-based middleware restricts admin-only endpoints
- Environment variables store sensitive configuration

---

## Database Schema Overview

### User
```
name, email, password, studentId, department, year, phone, role, avatar
```

### Schedule
```
day, startTime, endTime, course, courseName, courseCode, instructor, room, building, year, department
```

### Announcement
```
title, content, priority, category, author, createdAt
```

### Course
```
code, name, description, instructor, credits, department, year
```

### Assignment
```
title, description, courseName, courseCode, dueDate, createdAt
```

### Service
```
name, type, location, schedule, menu (for cafeteria)
```

### Directory
```
name, email, phone, role, department, office
```

---

## License

MIT License - See LICENSE file for details.

---

## Authors

Built for Bahir Dar University - Smart Campus Initiative
