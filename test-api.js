#!/usr/bin/env node

/**
 * Simple API Test Script for Study Sustainability Hub
 * Tests basic endpoints to verify the API is working
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test endpoints
const tests = [
  {
    name: 'University Programs Public',
    path: '/university-programs/public?page=1&limit=5',
    method: 'GET'
  },
  {
    name: 'Events Public',
    path: '/events/public?page=1&limit=5',
    method: 'GET'
  },
  {
    name: 'Jobs Public',
    path: '/jobs/public?page=1&limit=5',
    method: 'GET'
  },
  {
    name: 'Scholarships Public',
    path: '/scholarships/public?page=1&limit=5',
    method: 'GET'
  },
  {
    name: 'Professional Courses Public',
    path: '/professional-courses/public?page=1&limit=5',
    method: 'GET'
  },
  {
    name: 'Subscribers',
    path: '/subscribers',
    method: 'GET'
  },
  {
    name: 'Advertisements Public',
    path: '/advertise/public?page=1&limit=5',
    method: 'GET'
  },
  {
    name: 'Unique Institutions',
    path: '/university-programs/institutions',
    method: 'GET'
  }
];

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: test.path,
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            name: test.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData
          });
        } catch (error) {
          resolve({
            name: test.name,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            data: data,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        name: test.name,
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject({
        name: test.name,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Study Sustainability Hub API...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const result = await makeRequest(test);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${test.name}: ${result.status} - OK`);
        if (result.data && result.data.metadata) {
          console.log(`   📊 Total: ${result.data.metadata.total || 'N/A'}, Page: ${result.data.metadata.page || 'N/A'}`);
        }
      } else {
        console.log(`❌ ${test.name}: ${result.status} - FAILED`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.error || error.message}`);
      results.push({
        name: test.name,
        success: false,
        error: error.error || error.message
      });
    }
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 All tests passed! API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server status and logs.');
  }
  
  console.log('\n📋 Failed Tests:');
  results.filter(r => !r.success).forEach(result => {
    console.log(`   - ${result.name}: ${result.error || 'Unknown error'}`);
  });
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Import the Postman collection for comprehensive testing');
  console.log('   2. Use the Quick Test collection for basic functionality');
  console.log('   3. Check the README for detailed API documentation');
}

// Run tests
runTests().catch(console.error);
