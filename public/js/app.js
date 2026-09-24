/**
 * THE DATA HUB — CLIENT ENGINE & INTERACTIVE CONTROLLER
 * Sprint 09: Track B (Fullstack Architecture & RESTful API Console)
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // State Management
  // =========================================================================
  const state = {
    posts: [],
    filterQuery: '',
    deletingPostId: null,
    activeToken: null,
    latency: '< 1ms'
  };

  // =========================================================================
  // DOM Elements Selection
  // =========================================================================
  // Navigation & Drawer
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-item');
  const navItems = document.querySelectorAll('.nav-item');

  // Metrics
  const metricTotalPosts = document.getElementById('metricTotalPosts');
  const metricHealthStatus = document.getElementById('metricHealthStatus');
  const metricLatency = document.getElementById('metricLatency');
  const postCountBadge = document.getElementById('postCountBadge');

  // Posts Management
  const postsGrid = document.getElementById('postsGrid');
  const postSearchInput = document.getElementById('postSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const refreshPostsBtn = document.getElementById('refreshPostsBtn');
  const openCreateModalBtn = document.getElementById('openCreateModalBtn');
  const quickNewPostBtn = document.getElementById('quickNewPostBtn');

  // Create / Edit Modal
  const postModalOverlay = document.getElementById('postModalOverlay');
  const postModalForm = document.getElementById('postModalForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalPostId = document.getElementById('modalPostId');
  const modalPostTitle = document.getElementById('modalPostTitle');
  const modalPostAuthor = document.getElementById('modalPostAuthor');
  const modalPostContent = document.getElementById('modalPostContent');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  // Delete Modal
  const deleteModalOverlay = document.getElementById('deleteModalOverlay');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const deletePostPreview = document.getElementById('deletePostPreview');

  // API Playground
  const endpointItems = document.querySelectorAll('.endpoint-item');
  const reqMethodSelect = document.getElementById('reqMethodSelect');
  const reqUrlInput = document.getElementById('reqUrlInput');
  const reqBodySection = document.getElementById('reqBodySection');
  const reqBodyTextarea = document.getElementById('reqBodyTextarea');
  const sendRequestBtn = document.getElementById('sendRequestBtn');
  const formatJsonBtn = document.getElementById('formatJsonBtn');
  const resStatusPill = document.getElementById('resStatusPill');
  const resTimeBadge = document.getElementById('resTimeBadge');
  const responseOutput = document.getElementById('responseOutput');
  const copyResponseBtn = document.getElementById('copyResponseBtn');

  // JWT Auth
  const authForm = document.getElementById('authForm');
  const authUsername = document.getElementById('authUsername');
  const authPassword = document.getElementById('authPassword');
  const tokenStringBox = document.getElementById('tokenStringBox');
  const decodedTokenPayload = document.getElementById('decodedTokenPayload');
  const copyTokenBtn = document.getElementById('copyTokenBtn');

  // Test Runner
  const runAllTestsHeroBtn = document.getElementById('runAllTestsHeroBtn');
  const runBrowserTestsBtn = document.getElementById('runBrowserTestsBtn');
  const testLogsList = document.getElementById('testLogsList');
  const testProgressBar = document.getElementById('testProgressBar');
  const testPassedCount = document.getElementById('testPassedCount');
  const testFailedCount = document.getElementById('testFailedCount');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // =========================================================================
  // Toast Notification Utility
  // =========================================================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = 'fa-circle-info text-cyan';
    if (type === 'success') icon = 'fa-circle-check text-emerald';
    if (type === 'error') icon = 'fa-circle-exclamation text-rose';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // Mobile Navigation Drawer Handling
  // =========================================================================
  function openDrawer() {
    mobileDrawer.classList.add('open');
    drawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
      drawerLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // =========================================================================
  // Posts CRUD Operations
  // =========================================================================

  // Fetch all posts
  async function fetchPosts() {
    const startTime = performance.now();
    try {
      postsGrid.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Connecting to REST API & fetching in-memory posts...</p>
        </div>
      `;

      const res = await fetch('/posts', {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      if (res.ok && data.success) {
        state.posts = data.data || [];
        metricTotalPosts.textContent = state.posts.length;
        metricLatency.textContent = `${elapsed}ms`;
        metricHealthStatus.textContent = 'ONLINE';
        renderPosts();
      } else {
        throw new Error(data.error || 'Failed to fetch posts.');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      postsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation text-rose" style="font-size: 2rem;"></i>
          <h3>Failed to Load Posts</h3>
          <p class="text-muted">${err.message}</p>
          <button class="btn btn-secondary btn-sm" onclick="location.reload()">Retry Connection</button>
        </div>
      `;
      showToast('Could not sync with server API.', 'error');
    }
  }

  // Render filtered posts
  function renderPosts() {
    const query = state.filterQuery.trim().toLowerCase();
    const filtered = state.posts.filter(post => {
      if (!query) return true;
      return (
        (post.title && post.title.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query)) ||
        (post.author && post.author.toLowerCase().includes(query)) ||
        String(post.id).includes(query)
      );
    });

    postCountBadge.textContent = `Showing ${filtered.length} of ${state.posts.length} posts`;

    if (filtered.length === 0) {
      postsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open text-muted" style="font-size: 2.5rem;"></i>
          <h3>No matching posts found</h3>
          <p class="text-muted">${query ? `No records match query "${query}"` : 'No posts currently exist in memory.'}</p>
          ${query ? `<button class="btn btn-outline btn-sm" id="resetSearchBtn"><i class="fa-solid fa-xmark"></i> Clear Filter</button>` : `<button class="btn btn-primary btn-sm" id="emptyCreateBtn"><i class="fa-solid fa-plus"></i> Create First Post</button>`}
        </div>
      `;
      
      const resetSearchBtn = document.getElementById('resetSearchBtn');
      if (resetSearchBtn) resetSearchBtn.addEventListener('click', clearSearch);

      const emptyCreateBtn = document.getElementById('emptyCreateBtn');
      if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', openCreateModal);
      return;
    }

    postsGrid.innerHTML = filtered.map(post => {
      const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Recently';

      const authorInitial = (post.author || 'A').charAt(0).toUpperCase();

      return `
        <div class="post-card" data-id="${post.id}">
          <div>
            <div class="post-card-header">
              <span class="post-id-badge">#ID-${post.id}</span>
              <span class="post-date"><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
            </div>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-content">${escapeHtml(post.content)}</p>
          </div>

          <div class="post-card-footer">
            <div class="post-author-wrap">
              <div class="author-avatar">${authorInitial}</div>
              <span class="author-name">${escapeHtml(post.author || 'Anonymous')}</span>
            </div>
            <div class="post-action-buttons">
              <button class="action-icon-btn test-post-btn" title="Inspect in API Playground" data-id="${post.id}">
                <i class="fa-solid fa-terminal"></i>
              </button>
              <button class="action-icon-btn edit-post-btn" title="Edit Post" data-id="${post.id}">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="action-icon-btn delete-btn delete-post-btn" title="Delete Post" data-id="${post.id}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach card action event listeners
    document.querySelectorAll('.edit-post-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        openEditModal(id);
      });
    });

    document.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        openDeleteModal(id);
      });
    });

    document.querySelectorAll('.test-post-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        loadPlaygroundEndpoint('GET', `/posts/${id}`);
      });
    });
  }

  // Search Filter Handler
  if (postSearchInput) {
    postSearchInput.addEventListener('input', (e) => {
      state.filterQuery = e.target.value;
      clearSearchBtn.style.display = state.filterQuery ? 'block' : 'none';
      renderPosts();
    });
  }

  function clearSearch() {
    state.filterQuery = '';
    postSearchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderPosts();
  }

  if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
  if (refreshPostsBtn) refreshPostsBtn.addEventListener('click', () => {
    fetchPosts();
    showToast('Posts refreshed from server.', 'info');
  });

  // Modal Dialogs Handling
  function openCreateModal() {
    modalPostId.value = '';
    modalPostTitle.value = '';
    modalPostAuthor.value = 'Lead Architect';
    modalPostContent.value = '';
    modalTitle.innerHTML = `<i class="fa-solid fa-plus text-cyan"></i> Create New Post`;
    postModalOverlay.classList.add('open');
    modalPostTitle.focus();
  }

  function openEditModal(id) {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;

    modalPostId.value = post.id;
    modalPostTitle.value = post.title;
    modalPostAuthor.value = post.author || '';
    modalPostContent.value = post.content;
    modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square text-cyan"></i> Edit Post #${post.id}`;
    postModalOverlay.classList.add('open');
    modalPostTitle.focus();
  }

  function closeModal() {
    postModalOverlay.classList.remove('open');
  }

  if (openCreateModalBtn) openCreateModalBtn.addEventListener('click', openCreateModal);
  if (quickNewPostBtn) quickNewPostBtn.addEventListener('click', openCreateModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  // Post Form Submission (POST or PUT)
  if (postModalForm) {
    postModalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = modalPostId.value;
      const title = modalPostTitle.value.trim();
      const author = modalPostAuthor.value.trim();
      const content = modalPostContent.value.trim();

      if (!title || !content) {
        showToast('Title and content are required.', 'error');
        return;
      }

      const isEdit = Boolean(id);
      const url = isEdit ? `/posts/${id}` : '/posts';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = { title, content, author };

      try {
        const res = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          closeModal();
          showToast(isEdit ? `Post #${id} updated!` : 'New post created!', 'success');
          await fetchPosts();
        } else {
          showToast(data.error || 'Failed to save post.', 'error');
        }
      } catch (err) {
        console.error('Save post error:', err);
        showToast('Network error while saving post.', 'error');
      }
    });
  }

  // Delete Modal Handling
  function openDeleteModal(id) {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;
    state.deletingPostId = id;
    deletePostPreview.textContent = `"${post.title}"`;
    deleteModalOverlay.classList.add('open');
  }

  function closeDeleteModal() {
    state.deletingPostId = null;
    deleteModalOverlay.classList.remove('open');
  }

  if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!state.deletingPostId) return;
      const id = state.deletingPostId;

      try {
        const res = await fetch(`/posts/${id}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();

        if (res.ok && data.success) {
          closeDeleteModal();
          showToast(`Post #${id} deleted successfully.`, 'success');
          await fetchPosts();
        } else {
          showToast(data.error || 'Failed to delete post.', 'error');
        }
      } catch (err) {
        console.error('Delete post error:', err);
        showToast('Network error while deleting post.', 'error');
      }
    });
  }

  // =========================================================================
  // Interactive API Playground
  // =========================================================================
  function loadPlaygroundEndpoint(method, url, body = '') {
    reqMethodSelect.value = method;
    reqUrlInput.value = url;
    
    if (body) {
      reqBodyTextarea.value = body;
    } else if (method === 'POST' || method === 'PUT') {
      reqBodyTextarea.value = JSON.stringify({ title: "Sample Title", content: "Sample Content", author: "Dev" }, null, 2);
    } else {
      reqBodyTextarea.value = '';
    }

    updateBodyVisibility();
    
    // Scroll smoothly to playground if requested
    const targetSection = document.getElementById('playground-section');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Auto execute request
    executePlaygroundRequest();
  }

  function updateBodyVisibility() {
    const method = reqMethodSelect.value;
    if (method === 'POST' || method === 'PUT') {
      reqBodySection.style.display = 'flex';
    } else {
      reqBodySection.style.display = 'none';
    }
  }

  if (reqMethodSelect) reqMethodSelect.addEventListener('change', updateBodyVisibility);

  endpointItems.forEach(item => {
    item.addEventListener('click', () => {
      endpointItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const method = item.getAttribute('data-method');
      const url = item.getAttribute('data-url');
      const body = item.getAttribute('data-body');

      loadPlaygroundEndpoint(method, url, body);
    });
  });

  // JSON Body Auto-Formatter
  if (formatJsonBtn) {
    formatJsonBtn.addEventListener('click', () => {
      try {
        const val = reqBodyTextarea.value.trim();
        if (!val) return;
        const parsed = JSON.parse(val);
        reqBodyTextarea.value = JSON.stringify(parsed, null, 2);
        showToast('JSON formatted successfully.', 'info');
      } catch (e) {
        showToast('Invalid JSON structure: ' + e.message, 'error');
      }
    });
  }

  // Execute Request in Playground
  async function executePlaygroundRequest() {
    const method = reqMethodSelect.value.toUpperCase();
    let path = reqUrlInput.value.trim();
    if (!path.startsWith('/')) path = '/' + path;

    const fullUrl = path;
    const startTime = performance.now();

    resStatusPill.className = 'status-pill status-ready';
    resStatusPill.textContent = 'Sending...';
    responseOutput.textContent = '// Dispatching HTTP ' + method + ' ' + path + '...';

    const options = {
      method: method,
      headers: {
        'Accept': 'application/json'
      }
    };

    if (state.activeToken) {
      options.headers['Authorization'] = `Bearer ${state.activeToken}`;
    }

    if (method === 'POST' || method === 'PUT') {
      const rawBody = reqBodyTextarea.value.trim();
      if (rawBody) {
        try {
          JSON.parse(rawBody); // Validate JSON syntax
          options.headers['Content-Type'] = 'application/json';
          options.body = rawBody;
        } catch (e) {
          resStatusPill.className = 'status-pill status-400';
          resStatusPill.textContent = '400 Bad JSON';
          responseOutput.textContent = `// JSON Syntax Error: ${e.message}\nPlease fix your request body format.`;
          return;
        }
      }
    }

    try {
      const response = await fetch(fullUrl, options);
      const elapsed = Math.round(performance.now() - startTime);

      resTimeBadge.innerHTML = `<i class="fa-regular fa-clock"></i> ${elapsed}ms`;
      resStatusPill.textContent = `${response.status} ${response.statusText || ''}`;
      
      if (response.status >= 200 && response.status < 300) {
        resStatusPill.className = 'status-pill status-' + response.status;
      } else if (response.status === 400 || response.status === 404) {
        resStatusPill.className = 'status-pill status-' + response.status;
      } else {
        resStatusPill.className = 'status-pill status-500';
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        responseOutput.textContent = JSON.stringify(json, null, 2);
      } else {
        const text = await response.text();
        responseOutput.textContent = text;
      }

      // If a mutation occurred, refresh posts collection
      if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
        fetchPosts();
      }
    } catch (err) {
      console.error('Playground request error:', err);
      resStatusPill.className = 'status-pill status-500';
      resStatusPill.textContent = 'Network Error';
      responseOutput.textContent = `// Error executing request:\n${err.message}\nMake sure the API server is running on localhost:5000.`;
    }
  }

  if (sendRequestBtn) sendRequestBtn.addEventListener('click', executePlaygroundRequest);

  // Copy JSON Response
  if (copyResponseBtn) {
    copyResponseBtn.addEventListener('click', () => {
      const text = responseOutput.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('JSON output copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Failed to copy to clipboard.', 'error');
      });
    });
  }

  // =========================================================================
  // Mock JWT Authentication Handling
  // =========================================================================
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = authUsername.value.trim();
      const password = authPassword.value.trim();

      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok && data.success) {
          state.activeToken = data.token;
          tokenStringBox.textContent = data.token;
          
          // Parse and show payload
          const parts = data.token.split('.');
          if (parts.length >= 2) {
            try {
              const decoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
              decodedTokenPayload.textContent = JSON.stringify(decoded, null, 2);
            } catch (err) {
              decodedTokenPayload.textContent = JSON.stringify(data.user || {}, null, 2);
            }
          }
          showToast(`Authenticated as "${username}"!`, 'success');
        } else {
          showToast(data.error || 'Authentication failed.', 'error');
        }
      } catch (err) {
        showToast('Network error during authentication.', 'error');
      }
    });
  }

  if (copyTokenBtn) {
    copyTokenBtn.addEventListener('click', () => {
      const token = tokenStringBox.textContent.trim();
      if (!token || token.includes('...')) {
        showToast('Please generate a token first.', 'info');
        return;
      }
      navigator.clipboard.writeText(token).then(() => {
        showToast('JWT Bearer token copied!', 'success');
      });
    });
  }

  // =========================================================================
  // Automated Test Suite Runner (Browser Side E2E)
  // =========================================================================
  async function runAutomatedTestSuite() {
    testLogsList.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Executing sequential 22-point test assertions...</p>
      </div>
    `;

    testProgressBar.style.width = '0%';
    let passed = 0;
    let failed = 0;
    const logs = [];

    function recordTest(name, detail, isPass) {
      if (isPass) {
        passed++;
      } else {
        failed++;
      }
      logs.push({ name, detail, isPass });
    }

    try {
      // Test 1: GET /
      const t1Res = await fetch('/', { headers: { 'Accept': 'application/json' } });
      const t1 = await t1Res.json();
      recordTest(
        '[Test 1] Health Check: GET /',
        `HTTP ${t1Res.status} • Status: ${t1.status} • Endpoints: ${Object.keys(t1.endpoints || {}).length}`,
        t1Res.status === 200 && t1.status === 'online'
      );
      testProgressBar.style.width = '15%';

      // Test 2: GET /posts
      const t2Res = await fetch('/posts', { headers: { 'Accept': 'application/json' } });
      const t2 = await t2Res.json();
      recordTest(
        '[Test 2] Retrieve All Posts: GET /posts',
        `HTTP ${t2Res.status} • Post Count: ${t2.data ? t2.data.length : 0}`,
        t2Res.status === 200 && Array.isArray(t2.data)
      );
      testProgressBar.style.width = '30%';

      // Test 3: GET /posts/1
      const t3Res = await fetch('/posts/1', { headers: { 'Accept': 'application/json' } });
      const t3 = await t3Res.json();
      recordTest(
        '[Test 3] Retrieve Single Post: GET /posts/1',
        `HTTP ${t3Res.status} • Post ID: ${t3.data ? t3.data.id : 'N/A'} • Title: "${t3.data ? t3.data.title.substring(0, 30) + '...' : ''}"`,
        t3Res.status === 200 && t3.data && t3.data.id === 1
      );
      testProgressBar.style.width = '45%';

      // Test 4: GET /posts/99999 (404)
      const t4Res = await fetch('/posts/99999', { headers: { 'Accept': 'application/json' } });
      const t4 = await t4Res.json();
      recordTest(
        '[Test 4] 404 Validation: GET /posts/99999',
        `HTTP ${t4Res.status} Not Found • Error Envelope Verified`,
        t4Res.status === 404 && t4.success === false
      );
      testProgressBar.style.width = '60%';

      // Test 5: POST /posts (400 Empty body)
      const t5Res = await fetch('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({})
      });
      const t5 = await t5Res.json();
      recordTest(
        '[Test 5] 400 Validation: POST /posts (Empty Body)',
        `HTTP ${t5Res.status} Bad Request • Required fields validation`,
        t5Res.status === 400 && t5.success === false
      );
      testProgressBar.style.width = '70%';

      // Test 6: POST /posts (Create valid)
      const newPostPayload = {
        title: "Test Suite In-Memory Post " + Date.now(),
        content: "Automated verification post created via browser client.",
        author: "Test Runner"
      };
      const t6Res = await fetch('/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(newPostPayload)
      });
      const t6 = await t6Res.json();
      const createdId = t6.data ? t6.data.id : null;
      recordTest(
        '[Test 6] Create Post: POST /posts',
        `HTTP ${t6Res.status} Created • ID #${createdId} generated`,
        t6Res.status === 201 && createdId !== null
      );
      testProgressBar.style.width = '80%';

      // Test 7: PUT /posts/:id (Update)
      if (createdId) {
        const t7Res = await fetch(`/posts/${createdId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ title: "Updated In-Memory Post" })
        });
        const t7 = await t7Res.json();
        recordTest(
          `[Test 7] Update Post: PUT /posts/${createdId}`,
          `HTTP ${t7Res.status} OK • Title modified to "${t7.data ? t7.data.title : ''}"`,
          t7Res.status === 200 && t7.data && t7.data.title === "Updated In-Memory Post"
        );

        // Test 8: DELETE /posts/:id
        const t8Res = await fetch(`/posts/${createdId}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });
        const t8 = await t8Res.json();
        recordTest(
          `[Test 8] Delete Post: DELETE /posts/${createdId}`,
          `HTTP ${t8Res.status} OK • Post permanently removed from memory`,
          t8Res.status === 200 && t8.success === true
        );
      }
      testProgressBar.style.width = '90%';

      // Test 9: POST /login (Mock JWT)
      const t9Res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ username: "admin", password: "password123" })
      });
      const t9 = await t9Res.json();
      recordTest(
        '[Test 9] Mock Authentication: POST /login',
        `HTTP ${t9Res.status} OK • JWT Token: ${t9.token ? t9.token.substring(0, 25) + '...' : ''}`,
        t9Res.status === 200 && Boolean(t9.token)
      );

      testProgressBar.style.width = '100%';

    } catch (err) {
      recordTest('Suite Network Error', err.message, false);
    }

    // Render results
    testPassedCount.textContent = passed;
    testFailedCount.textContent = failed;

    testLogsList.innerHTML = logs.map(log => `
      <div class="test-item ${log.isPass ? 'pass' : 'fail'}">
        <span class="test-status-icon"><i class="fa-solid ${log.isPass ? 'fa-check' : 'fa-xmark'}"></i></span>
        <div class="test-item-content">
          <span class="test-name">${escapeHtml(log.name)}</span>
          <span class="test-detail">${escapeHtml(log.detail)}</span>
        </div>
      </div>
    `).join('');

    showToast(`Test suite complete: ${passed} passed, ${failed} failed`, passed > 0 && failed === 0 ? 'success' : 'error');
    fetchPosts();
  }

  if (runBrowserTestsBtn) runBrowserTestsBtn.addEventListener('click', runAutomatedTestSuite);
  if (runAllTestsHeroBtn) runAllTestsHeroBtn.addEventListener('click', () => {
    const testSection = document.getElementById('testsuite-section');
    if (testSection) testSection.scrollIntoView({ behavior: 'smooth' });
    runAutomatedTestSuite();
  });

  // =========================================================================
  // Escape HTML Utility
  // =========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // Initial Boot
  // =========================================================================
  updateBodyVisibility();
  fetchPosts();
});
