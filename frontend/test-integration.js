
// Constantes pour chaînes dupliquées (optimisation SonarJS)
const STR_POST = 'POST';
// Integration test script for HustleFinderIA
// Tests frontend-backend communication and functionality
const logger = {
  info: (msg) => console.log(`[TEST-INFO] ${msg}`),
  warn: (msg) => console.warn(`[TEST-WARN] ${msg}`),
  error: (msg) => console.error(`[TEST-ERROR] ${msg}`),
  debug: (msg) => console.debug(`[TEST-DEBUG] ${msg}`)
};

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const FRONTEND_URL = 'http://localhost:5174';
const BACKEND_URL = 'http://localhost:5000';
const results = [];

// Test helper function
async function runTest(name, testFunction) {
  try {
    const start = Date.now();
    const result = await testFunction();
    const duration = Date.now() - start;

    results.push({
      name,
      status: 'success',
      duration: `${duration}ms`,
      result
    });

    return true;
  } catch (error) {
    results.push({
      name,
      status: 'error',
      error: error.message
    });

    return false;
  }
}

// Test 1: Frontend Accessibility
async function testFrontendAccess() {
  const response = await fetch(FRONTEND_URL);
  if (!response.ok) {
    throw new Error(`Frontend not accessible: ${response.status}`);
  }

  const html = await response.text();
  if (!html.includes('Hustle Finder V1')) {
    throw new Error('Frontend HTML does not contain expected title');
  }

  return 'Frontend is accessible and serving correct content';
}

// Test 2: Backend Health Check
async function testBackendHealth() {
  const response = await fetch(`${BACKEND_URL}/health`);
  if (!response.ok) {
    throw new Error(`Backend health check failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error('Backend health status is not OK');
  }

  return data;
}

// Test 3: Ideas API
async function testIdeasAPI() {
  const response = await fetch(`${BACKEND_URL}/api/ideas`);
  if (!response.ok) {
    throw new Error(`Ideas API failed: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.ideas)) {
    throw new Error('Ideas API does not return ideas array');
  }

  return {
    message: 'Ideas API working correctly',
    ideas_count: data.ideas.length,
    sample_idea: data.ideas[0]?.title || 'No ideas found'
  };
}

// Test 4: Projects API
async function testProjectsAPI() {
  const response = await fetch(`${BACKEND_URL}/api/projects`);
  if (!response.ok) {
    throw new Error(`Projects API failed: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.projects)) {
    throw new Error('Projects API does not return projects array');
  }

  return {
    message: 'Projects API working correctly',
    projects_count: data.projects.length,
    sample_project: data.projects[0]?.title || 'No projects found'
  };
}

// Test 5: AI Chat API
async function testAIChatAPI() {
  const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
    method: STR_POST,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Test de connexion API IA',
      type: 'chat'
    })
  });

  if (!response.ok) {
    throw new Error(`AI Chat API failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.response) {
    throw new Error('AI Chat API does not return response');
  }

  return {
    message: 'AI Chat API working correctly',
    ai_response: data.response,
    model: data.model,
    response_time: data.response_time_ms
  };
}

// Test 6: CORS Configuration
async function testCORSConfiguration() {
  const response = await fetch(`${BACKEND_URL}/api/ideas`, {
    headers: {
      'Origin': FRONTEND_URL
    }
  });

  if (!response.ok) {
    throw new Error(`CORS test failed: ${response.status}`);
  }

  return 'CORS configuration allows frontend access';
}

// Test 7: Database Operations (Create Idea)
async function testDatabaseOperations() {
  const testIdea = {
    title: 'Test Idea Integration',
    description: 'Test idea for integration testing',
    category: 'test',
    priority: 'medium'
  };

  const response = await fetch(`${BACKEND_URL}/api/ideas`, {
    method: STR_POST,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testIdea)
  });

  if (!response.ok) {
    throw new Error(`Database operation failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.idea || !data.idea.id) {
    throw new Error('Database operation did not return created idea');
  }

  return {
    message: 'Database operations working correctly',
    created_idea_id: data.idea.id,
    created_idea_title: data.idea.title
  };
}

// Test functions array
const testFunctions = [
  ['Frontend Access', testFrontendAccess],
  ['Backend Health', testBackendHealth],
  ['Ideas API', testIdeasAPI],
  ['Projects API', testProjectsAPI],
  ['AI Chat API', testAIChatAPI],
  ['CORS Configuration', testCORSConfiguration],
  ['Database Operations', testDatabaseOperations]
];

// Main test runner
async function runAllTests() {
  let successCount = 0;

  for (const [name, testFn] of testFunctions) {
    const success = await runTest(name, testFn);
    if (success) successCount++;
    logger.debug(''); // Empty line between tests
  }

  // Summary
  logger.debug(`✅ Passed: ${successCount}/${testFunctions.length}`);
  if (successCount === testFunctions.length) {
    logger.info('🎉 All tests passed!');
  } else {
    logger.error('❌ Some tests failed!');
  }

  // Detailed results
  logger.info(JSON.stringify(results, null, 2));

  return successCount === testFunctions.length;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Test runner failed:', error);
      process.exit(1);
    });
}

export { runAllTests, runTest };