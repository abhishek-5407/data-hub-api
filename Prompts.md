# Sprint 09: Engineering Residency AI Audit Log (Prompts.md)

**Engineer Name / Residency ID:** Associate Engineer  
**Track:** Track B — Fullstack Architecture (RESTful API Server)  
**Sprint:** Sprint 09: The Great Split (Phase 3: Core Engineering)  
**Project:** "The Data Hub" (Node.js & Express RESTful API Server)  
**Submission Date:** August 2026  

---

## 1. Executive Summary & Track Declaration

Pursuant to Sprint 09 guidelines, Track B (Fullstack Architecture) was declared. The goal of this sprint is to transition from an API consumer to an API provider by architecting a lightweight, highly responsive, and robust RESTful API server using Node.js and Express.

---

## 2. LLM Prompt Log & Architectural Consultation

Below is the chronological audit log of conceptual clarifications and architecture design queries conducted during the development of "The Data Hub".

### Entry 1: Core Express & Middleware Sequencing
- **Target Objective:** Understand optimal middleware chaining and JSON payload parsing lifecycle in Express.js.
- **Prompt:**
  > "How does Express.js process middleware pipelines sequentially, and why must `express.json()` be mounted prior to resource route definitions when intercepting HTTP POST/PUT payloads?"
- **Conceptual Takeaway:** Express evaluates middleware in strict declaration order (`app.use()`). When a POST/PUT request arrives, `express.json()` streams and parses the raw JSON body buffer into `req.body`. If route handlers are declared before `express.json()`, `req.body` evaluates to `undefined`.
- **Implementation in Code:** Placed `app.use(express.json())` and the custom logging middleware at the very top of `server.js` before all route declarations.

---

### Entry 2: Request Logging Middleware Implementation
- **Target Objective:** Architect a custom middleware to log incoming HTTP method, URL path, and timestamp according to Sprint 09 Phase 3 specs.
- **Prompt:**
  > "What is the standard pattern for a custom Express middleware that logs `[METHOD] /url - TIMESTAMP` without blocking the request pipeline?"
- **Conceptual Takeaway:** Middleware takes `(req, res, next)` arguments. The timestamp can be formatted using `toLocaleTimeString('en-US')`. Calling `next()` is strictly required to pass execution to the subsequent handler in the stack.
- **Implementation in Code:** Integrated `app.use((req, res, next) => { ... next(); })` in `server.js`.

---

### Entry 3: In-Memory REST CRUD Design & HTTP Status Codes
- **Target Objective:** Validate standard REST response patterns, status code mapping, and data sanitization for in-memory array manipulation.
- **Prompt:**
  > "What are the industry-standard REST status codes for CRUD operations on an in-memory collection (POST creation, PUT updates, DELETE removal, and 404/400 validation failures)?"
- **Conceptual Takeaway:**
  - `GET /posts` -> `200 OK`
  - `GET /posts/:id` -> `200 OK` (or `404 Not Found` if missing)
  - `POST /posts` -> `201 Created` with created object payload
  - `PUT /posts/:id` -> `200 OK` (or `404 Not Found` / `400 Bad Request`)
  - `DELETE /posts/:id` -> `200 OK` with deleted confirmation
- **Implementation in Code:** Structured all 5 REST endpoints in `server.js` with comprehensive input validation and proper error envelope responses (`{ success: false, error: "..." }`).

---

### Entry 4: Mock JWT Authentication Structure
- **Target Objective:** Design a standards-compliant mock JWT token generator for `POST /login` without adding external cryptographic library bloat during in-memory phase.
- **Prompt:**
  > "How can we structure a mock JSON Web Token (JWT) in Node.js using standard Base64URL encoding for header and payload with a mock signature?"
- **Conceptual Takeaway:** JWT format consists of `header.payload.signature` joined by periods (`.`). Using Node's native `Buffer.from(JSON.stringify(...)).toString('base64url')` provides standard format compliance without heavy dependencies.
- **Implementation in Code:** Built `POST /login` endpoint returning standard Bearer token format with username, role, and expiration timestamps.

---

## 3. Compliance Declaration

I hereby confirm that:
1. All core logic, endpoint definitions, and test suites were designed and verified specifically for Sprint 09 requirements.
2. AI assistance was strictly limited to concept clarification, architecture validation, and debugging per the Residency AI Policy.
3. No unauthorized third-party proprietary code was copied.
