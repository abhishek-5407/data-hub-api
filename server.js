const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware Configuration
// ==========================================

// Global JSON body parser
app.use(express.json());

// Serve static assets from public directory (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Phase 3: Custom Request Logging Middleware
// Intercepts every incoming request and logs HTTP method, URL path, and timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });
  console.log(`[${req.method}] ${req.originalUrl || req.url} - ${timestamp}`);
  next();
});

// ==========================================
// Phase 2: In-Memory Database (Mock Store)
// ==========================================
let blogPosts = [
  {
    id: 1,
    title: "Getting Started with Node.js & Express",
    content: "Express is a minimalist web framework for Node.js that simplifies routing and middleware integration.",
    author: "System Architect",
    createdAt: "2026-08-08T09:00:00.000Z"
  },
  {
    id: 2,
    title: "RESTful API Architectural Standards",
    content: "REST principles emphasize stateless communication, standard HTTP verbs, and predictable JSON resource representations.",
    author: "Backend Lead",
    createdAt: "2026-08-08T09:30:00.000Z"
  },
  {
    id: 3,
    title: "Middleware Pipelines in Modern Backends",
    content: "Middleware functions provide granular control over the request-response cycle for logging, authentication, and error handling.",
    author: "Senior Engineer",
    createdAt: "2026-08-08T10:00:00.000Z"
  }
];

// ==========================================
// API Root / Health Check & Interactive Dashboard
// ==========================================
app.get('/', (req, res) => {
  // If browser is navigating directly to / or format=html is requested
  const acceptHeader = req.headers['accept'] || '';
  const isBrowserNav = req.headers['sec-fetch-mode'] === 'navigate' ||
                       (acceptHeader.includes('text/html') && !acceptHeader.includes('application/json'));

  if (isBrowserNav || req.query.format === 'html') {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }

  // Otherwise return JSON API health overview
  res.status(200).json({
    status: "online",
    message: "The Data Hub RESTful API Server is operational.",
    version: "1.0.0",
    sprint: "Sprint 09 - Phase 3: Core Engineering",
    endpoints: {
      "GET /posts": "Retrieve all blog posts",
      "GET /posts/:id": "Retrieve a single blog post by ID",
      "POST /posts": "Create a new blog post (requires title & content in JSON body)",
      "PUT /posts/:id": "Update an existing blog post by ID",
      "DELETE /posts/:id": "Delete a blog post by ID",
      "POST /login": "Authenticate and receive a mock JWT token"
    }
  });
});

app.get(['/dashboard', '/console'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// Phase 1 & 2: RESTful Blog Resource Endpoints
// ==========================================

/**
 * @route   GET /posts
 * @desc    Retrieve all blog posts
 * @access  Public
 */
app.get('/posts', (req, res) => {
  res.status(200).json({
    success: true,
    count: blogPosts.length,
    data: blogPosts
  });
});

/**
 * @route   GET /posts/:id
 * @desc    Retrieve a single blog post by ID
 * @access  Public
 */
app.get('/posts/:id', (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  if (isNaN(targetId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid post ID. ID must be an integer."
    });
  }

  const post = blogPosts.find(item => item.id === targetId);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: `Blog post with ID ${targetId} was not found.`
    });
  }

  res.status(200).json({
    success: true,
    data: post
  });
});

/**
 * @route   POST /posts
 * @desc    Create a new blog post
 * @access  Public
 */
app.post('/posts', (req, res) => {
  const { title, content, author } = req.body;

  // Validation: Mandatory fields
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: "Validation failed: 'title' is required and must be a non-empty string."
    });
  }

  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({
      success: false,
      error: "Validation failed: 'content' is required and must be a non-empty string."
    });
  }

  // Construct new post record with unique ID and timestamp
  const newPost = {
    id: Date.now(),
    title: title.trim(),
    content: content.trim(),
    author: (author && typeof author === 'string' && author.trim()) ? author.trim() : "Anonymous",
    createdAt: new Date().toISOString()
  };

  // Push to in-memory array
  blogPosts.push(newPost);

  res.status(201).json({
    success: true,
    message: "Blog post created successfully.",
    data: newPost
  });
});

/**
 * @route   PUT /posts/:id
 * @desc    Update an existing blog post by ID
 * @access  Public
 */
app.put('/posts/:id', (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  if (isNaN(targetId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid post ID. ID must be an integer."
    });
  }

  const postIndex = blogPosts.findIndex(item => item.id === targetId);

  if (postIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Cannot update. Blog post with ID ${targetId} was not found.`
    });
  }

  const { title, content, author } = req.body;

  if (!title && !content && !author) {
    return res.status(400).json({
      success: false,
      error: "Update payload must include at least one field: 'title', 'content', or 'author'."
    });
  }

  const existingPost = blogPosts[postIndex];

  // Update fields while preserving existing values and ID
  const updatedPost = {
    ...existingPost,
    title: title !== undefined && typeof title === 'string' && title.trim() !== '' ? title.trim() : existingPost.title,
    content: content !== undefined && typeof content === 'string' && content.trim() !== '' ? content.trim() : existingPost.content,
    author: author !== undefined && typeof author === 'string' && author.trim() !== '' ? author.trim() : existingPost.author,
    updatedAt: new Date().toISOString()
  };

  blogPosts[postIndex] = updatedPost;

  res.status(200).json({
    success: true,
    message: `Blog post ${targetId} updated successfully.`,
    data: updatedPost
  });
});

/**
 * @route   DELETE /posts/:id
 * @desc    Delete a blog post by ID
 * @access  Public
 */
app.delete('/posts/:id', (req, res) => {
  const targetId = parseInt(req.params.id, 10);

  if (isNaN(targetId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid post ID. ID must be an integer."
    });
  }

  const initialCount = blogPosts.length;
  const targetPost = blogPosts.find(item => item.id === targetId);

  if (!targetPost) {
    return res.status(404).json({
      success: false,
      error: `Cannot delete. Blog post with ID ${targetId} was not found.`
    });
  }

  // Filter out the post matching the target ID
  blogPosts = blogPosts.filter(item => item.id !== targetId);

  res.status(200).json({
    success: true,
    message: `Blog post with ID ${targetId} was successfully deleted.`,
    deletedPost: targetPost,
    remainingCount: blogPosts.length
  });
});

// ==========================================
// Phase 3: Auth Mock Endpoint
// ==========================================

/**
 * @route   POST /login
 * @desc    Accept credential parameters and return mock JSON Web Token (JWT)
 * @access  Public
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validation
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Authentication failed: Both 'username' and 'password' are required in request body."
    });
  }

  // Generate standardized mock JWT structure
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    role: username.toLowerCase() === "admin" ? "administrator" : "developer",
    track: "Track B - Fullstack Core Engineering",
    sprint: "Sprint 09",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiry
  })).toString('base64url');
  const signature = "sprint09_mock_signature_datahub_sec_key";

  const mockJwtToken = `${header}.${payload}.${signature}`;

  res.status(200).json({
    success: true,
    message: "Authentication successful.",
    user: {
      username: username,
      role: username.toLowerCase() === "admin" ? "administrator" : "developer"
    },
    tokenType: "Bearer",
    token: mockJwtToken
  });
});

// ==========================================
// Catch-All 404 & Global Error Handler
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Resource not found: [${req.method}] ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack || err.message);
  res.status(500).json({
    success: false,
    error: "Internal Server Error occurred on the API server."
  });
});

// ==========================================
// Port Binding & Server Initialization
// ==========================================
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 The Data Hub API Server is live on Port ${PORT}`);
    console.log(`📡 Local URL: http://localhost:${PORT}`);
    console.log(`📝 Health Check: http://localhost:${PORT}/`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
      console.error(`👉 Tip: Terminate the running process or start with: $env:PORT=5001; npm run dev\n`);
    } else {
      console.error('Server error:', err);
    }
  });
}

module.exports = app;
