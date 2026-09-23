# 🚀 The Data Hub — RESTful API Server

> **Sprint 09: The Great Split — Phase 3: Core Engineering**  
> **Track:** Track B: Fullstack Developers / Backend Architecture  
> **Author:** Engineering Residency Associate  

---

## 📌 Executive Summary

**The Data Hub** is a commercial-grade, high-performance RESTful API server engineered with **Node.js** and **Express.js**. This project transitions our architecture from an API consumer to a robust API provider, delivering standardized HTTP responses, structured JSON envelopes, custom request-logging middleware, in-memory array database management, and mock JWT authentication.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Server-side JavaScript runtime environment |
| **Express.js** | Minimalist web application framework for routing and middleware |
| **Nodemon** | Hot-reloading development daemon for rapid iteration |
| **Postman / Thunder Client** | QA endpoint verification and API testing suite |

---

## 📂 Project Architecture

```
data-hub-api/
├── server.js                          # Core Express server, middleware & CRUD routes
├── package.json                       # Scripts, dependencies and engine metadata
├── .gitignore                         # Git exclusion rules (node_modules, logs)
├── The_Data_Hub_API.postman_collection.json # Exportable Postman collection
├── test-api.js                        # Automated end-to-end testing suite
├── Prompts.md                         # Mandatory Residency AI Prompt Audit Log
└── README.md                          # API documentation, deployment & demo guide
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
Ensure **Node.js (v18+)** and **npm** are installed on your workstation.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server (Hot-Reloading with Nodemon)
```bash
npm run dev
```
The server will initialize on `http://localhost:5000`.

### 4. Run Production Server
```bash
npm start
```

### 5. Execute Automated Test Suite
```bash
npm test
```

---

## 📡 REST API Reference & Endpoints

Base URL: `http://localhost:5000`

| HTTP Method | Route | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | API Status & Endpoint Directory | `200 OK` |
| **GET** | `/posts` | Retrieve all blog posts | `200 OK` |
| **GET** | `/posts/:id` | Retrieve single blog post by ID | `200 OK` / `404 Not Found` |
| **POST** | `/posts` | Create a new blog post | `201 Created` / `400 Bad Request` |
| **PUT** | `/posts/:id` | Update an existing blog post | `200 OK` / `404 Not Found` |
| **DELETE**| `/posts/:id` | Remove a blog post by ID | `200 OK` / `404 Not Found` |
| **POST** | `/login` | Authenticate & issue Mock JWT | `200 OK` / `400 Bad Request` |

---

## 🔍 Request & Response Samples

### 1. Health & Status Check
- **Request:** `GET /`
- **cURL:**
  ```bash
  curl -X GET http://localhost:5000/
  ```
- **Response:**
  ```json
  {
    "status": "online",
    "message": "The Data Hub RESTful API Server is operational.",
    "version": "1.0.0",
    "sprint": "Sprint 09 - Phase 3: Core Engineering",
    "endpoints": { ... }
  }
  ```

---

### 2. Retrieve All Posts
- **Request:** `GET /posts`
- **cURL:**
  ```bash
  curl -X GET http://localhost:5000/posts
  ```
- **Response:**
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "id": 1,
        "title": "Getting Started with Node.js & Express",
        "content": "Express is a minimalist web framework for Node.js...",
        "author": "System Architect",
        "createdAt": "2026-08-08T09:00:00.000Z"
      }
    ]
  }
  ```

---

### 3. Create a New Post
- **Request:** `POST /posts`
- **Headers:** `Content-Type: application/json`
- **cURL:**
  ```bash
  curl -X POST http://localhost:5000/posts \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Microservices Architecture\", \"content\": \"Event-driven patterns.\", \"author\": \"Lead Dev\"}"
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Blog post created successfully.",
    "data": {
      "id": 1724419200000,
      "title": "Microservices Architecture",
      "content": "Event-driven patterns.",
      "author": "Lead Dev",
      "createdAt": "2026-08-08T12:00:00.000Z"
    }
  }
  ```

---

### 4. Update Post by ID
- **Request:** `PUT /posts/1`
- **Headers:** `Content-Type: application/json`
- **cURL:**
  ```bash
  curl -X PUT http://localhost:5000/posts/1 \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Getting Started with Node.js & Express (Updated)\"}"
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Blog post 1 updated successfully.",
    "data": { ... }
  }
  ```

---

### 5. Delete Post by ID
- **Request:** `DELETE /posts/1`
- **cURL:**
  ```bash
  curl -X DELETE http://localhost:5000/posts/1
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Blog post with ID 1 was successfully deleted.",
    "deletedPost": { ... },
    "remainingCount": 2
  }
  ```

---

### 6. Authentication (Mock JWT Token)
- **Request:** `POST /login`
- **Headers:** `Content-Type: application/json`
- **cURL:**
  ```bash
  curl -X POST http://localhost:5000/login \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"engineer_admin\", \"password\": \"Secr3tP@ssw0rd!\"}"
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Authentication successful.",
    "user": {
      "username": "engineer_admin",
      "role": "administrator"
    },
    "tokenType": "Bearer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## ⚡ Custom Logging Middleware

Every incoming HTTP request is intercepted and logged to the terminal stdout in real time:

```
[GET] /posts - 10:05:12 AM
[POST] /posts - 10:05:45 AM
[PUT] /posts/1 - 10:06:02 AM
[DELETE] /posts/2 - 10:06:20 AM
[POST] /login - 10:06:40 AM
```

---

## 🧪 Postman & Thunder Client Testing

1. Open **Postman** or **Thunder Client** (VS Code).
2. Click **Import** and select `The_Data_Hub_API.postman_collection.json`.
3. All 7 pre-configured requests (Health Check, GET, POST, PUT, DELETE, Login, 404 QA) are ready to execute against `http://localhost:5000`.

---

## 🌐 Cloud Deployment Guide (Render / Railway)

### Deploying to Render.com:
1. Push your repository to **GitHub** (e.g., `github.com/<username>/data-hub-api`).
2. Log in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Select your repository.
4. Configure service settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Deploy Web Service**.
6. Render will assign a live URL (e.g., `https://data-hub-api.onrender.com`).

---

## 🎥 3-Minute Demo Video Script (Fullstack Track B)

When recording your submission video (maximum 3 minutes):

1. **Introduction (0:00 - 0:30):**
   - State your name and declare **Track B: Fullstack Developers / REST API Server**.
   - Briefly show `server.js` (highlight `express.json()`, custom logging middleware, in-memory array, and route handlers).
2. **Postman / Thunder Client Demonstration (0:30 - 2:00):**
   - Open Postman / Thunder Client.
   - Run `GET /posts` to show the initial database records.
   - Run `POST /posts` with JSON body `{"title": "Demo Post", "content": "Testing via Postman"}` -> show `201 Created`.
   - Run `GET /posts` again to prove the new post is stored in memory.
   - Run `PUT /posts/:id` to show modification -> show `200 OK`.
   - Run `DELETE /posts/:id` to remove the post -> show confirmation.
   - Run `POST /login` with credentials -> show returned mock JWT token.
3. **Console Verification & Conclusion (2:00 - 2:45):**
   - Switch to your terminal console and show the live logs generated by your custom middleware (`[GET] /posts - HH:MM:SS AM`).
   - Conclude by stating compliance with Sprint 09 Track B specifications.
