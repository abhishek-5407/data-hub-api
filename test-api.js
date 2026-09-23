/**
 * The Data Hub API - Automated Verification Suite
 * Executes sequential end-to-end tests against all endpoints and validates responses.
 */

const http = require('http');
const app = require('./server');

const TEST_PORT = 5055;
let server;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody, headers: res.headers });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting The Data Hub API Automated Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Health / Root endpoint
    console.log('[Test 1] Health Check & Overview: GET /');
    const health = await makeRequest('GET', '/');
    assert(health.status === 200, 'GET / returned HTTP 200');
    assert(health.data.status === 'online', 'Health status is "online"');
    assert(typeof health.data.endpoints === 'object', 'Endpoint directory returned');

    // 2. Test GET /posts
    console.log('\n[Test 2] Retrieve All Posts: GET /posts');
    const allPosts = await makeRequest('GET', '/posts');
    assert(allPosts.status === 200, 'GET /posts returned HTTP 200');
    assert(Array.isArray(allPosts.data.data), 'Payload contains posts array');
    assert(allPosts.data.count > 0, `Initial post count is ${allPosts.data.count}`);

    // 3. Test GET /posts/:id (Existing)
    console.log('\n[Test 3] Retrieve Single Post: GET /posts/1');
    const singlePost = await makeRequest('GET', '/posts/1');
    assert(singlePost.status === 200, 'GET /posts/1 returned HTTP 200');
    assert(singlePost.data.data.id === 1, 'Post ID matches requested ID 1');

    // 4. Test GET /posts/:id (Non-existent 404)
    console.log('\n[Test 4] QA Validation (404 Not Found): GET /posts/99999');
    const missingPost = await makeRequest('GET', '/posts/99999');
    assert(missingPost.status === 404, 'GET /posts/99999 returned HTTP 404');
    assert(missingPost.data.success === false, 'Error envelope format verified');

    // 5. Test POST /posts (Validation failure on missing fields)
    console.log('\n[Test 5] QA Validation (400 Bad Request): POST /posts (Empty Body)');
    const emptyPost = await makeRequest('POST', '/posts', {});
    assert(emptyPost.status === 400, 'POST /posts with empty payload returned HTTP 400');

    // 6. Test POST /posts (Success)
    console.log('\n[Test 6] Create New Post: POST /posts');
    const newPostPayload = {
      title: "Automated Test Post Title",
      content: "Demonstrating in-memory array manipulation and status 201 response.",
      author: "QA Test Runner"
    };
    const createRes = await makeRequest('POST', '/posts', newPostPayload);
    assert(createRes.status === 201, 'POST /posts returned HTTP 201 Created');
    assert(createRes.data.data.title === newPostPayload.title, 'Created post title matches input');
    assert(typeof createRes.data.data.id === 'number', 'Generated numeric ID present');
    const createdId = createRes.data.data.id;

    // 7. Test PUT /posts/:id (Update)
    console.log(`\n[Test 7] Update Post: PUT /posts/${createdId}`);
    const updatePayload = {
      title: "Updated Title After Creation",
      content: "Updated content successfully verified via automated suite."
    };
    const updateRes = await makeRequest('PUT', `/posts/${createdId}`, updatePayload);
    assert(updateRes.status === 200, 'PUT /posts/:id returned HTTP 200 OK');
    assert(updateRes.data.data.title === updatePayload.title, 'Post title updated in memory');

    // 8. Test DELETE /posts/:id (Delete)
    console.log(`\n[Test 8] Delete Post: DELETE /posts/${createdId}`);
    const deleteRes = await makeRequest('DELETE', `/posts/${createdId}`);
    assert(deleteRes.status === 200, 'DELETE /posts/:id returned HTTP 200 OK');
    assert(deleteRes.data.deletedPost.id === createdId, 'Deleted post ID matches');

    // Verify post is truly gone
    const verifyGone = await makeRequest('GET', `/posts/${createdId}`);
    assert(verifyGone.status === 404, 'Post no longer exists (HTTP 404 confirmed)');

    // 9. Test POST /login (Auth Mock)
    console.log('\n[Test 9] Mock Authentication: POST /login');
    const loginRes = await makeRequest('POST', '/login', {
      username: "engineering_lead",
      password: "MasterPassword123!"
    });
    assert(loginRes.status === 200, 'POST /login returned HTTP 200');
    assert(typeof loginRes.data.token === 'string', 'Returned mock JWT token string');
    assert(loginRes.data.tokenType === 'Bearer', 'Token type is Bearer');

    console.log('\n======================================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  }
}

// Start test server instance
server = app.listen(TEST_PORT, () => {
  runTests();
});
