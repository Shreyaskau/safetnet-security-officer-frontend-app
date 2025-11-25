/**
 * Quick test script to verify backend connectivity
 * Run this in React Native debugger console or add to app temporarily
 */

const testBackend = async () => {
  console.log("=== TESTING BACKEND CONNECTIVITY ===");
  
  const url = "https://safetnet.onrender.com/api/security/login/";
  
  try {
    // Test 1: Simple fetch
    console.log("Test 1: Fetching with fetch()...");
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test_officer',
        password: 'TestOfficer123!'
      }),
    });
    
    console.log("✅ Fetch successful!");
    console.log("Status:", response.status);
    const data = await response.text();
    console.log("Response:", data);
    
  } catch (error) {
    console.error("❌ Fetch failed:", error.message);
    console.error("Error details:", error);
  }
  
  try {
    // Test 2: Axios
    console.log("\nTest 2: Testing with axios...");
    const axios = require('axios');
    const axiosResponse = await axios.post(url, {
      username: 'test_officer',
      password: 'TestOfficer123!'
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    console.log("✅ Axios successful!");
    console.log("Status:", axiosResponse.status);
    console.log("Data:", axiosResponse.data);
    
  } catch (error) {
    console.error("❌ Axios failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error details:", error);
  }
  
  console.log("================================");
};

// Run the test
testBackend();

