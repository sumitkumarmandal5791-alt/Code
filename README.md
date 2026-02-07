# LeetCode Clone – Online Coding Platform

A modern online coding platform inspired by LeetCode, built with **MERN stack** (MongoDB, Express.js, React, Node.js), styled with **Tailwind CSS + DaisyUI**, and powered by **Judge0** for code execution.

> Prepared by **Sumit Mandal**

## Features

- Browse and filter coding problems
- Rich text problem descriptions with support for code blocks & images
- Multiple programming language support (via Judge0)
- Real-time code submission & execution
- Detailed submission results (status, time, memory, test cases)
- User authentication (Sign up / Login)
- User profile with submission history
- Clean and responsive UI with dark/light mode
- Monaco Editor (or similar) for code editing experience

## Tech Stack

**Frontend**
- React (Vite or CRA)
- Tailwind CSS
- DaisyUI (component library)
- Axios (for API calls)
- React Router DOM
- (likely) React Hook Form + Zod / Yup
- (likely) Monaco Editor or CodeMirror

**Backend**
- Node.js + Express.js
- MongoDB (Mongoose ODM)
- JWT Authentication
- Judge0 API integration (code execution engine)

**Code Execution**
- Judge0 (self-hosted or using public API)

## Folder Structure
LeetCode/
├── frontend/                 → React + Tailwind + DaisyUI frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  → Node.js + Express API
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── config/
│   ├── app.js / server.js
│   └── package.json
│
├── .gitignore
└── README.md

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- Judge0 instance (local or public API)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd LeetCode
```

### Backend Start
cd backend
npm install

create .env file