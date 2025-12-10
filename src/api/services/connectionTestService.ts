import axios from 'axios';
import { ENABLE_API_CALLS } from '../config';
import apiConfig from '../config';

export interface ConnectionStatus {
  isConnected: boolean;
  baseURL: string;
  responseTime?: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
  databaseConnected?: boolean;
  databaseTestResult?: string;
  apiEndpoint?: string;
}

/**
 * Test the backend API connection and database connectivity
 * This function tests the Django REST API endpoints and verifies database access
 */
export const testConnection = async (): Promise<ConnectionStatus> => {
  // Use BASE_URL from config.ts and append /api/security/
  // Ensure baseURL ends with / to properly combine with endpoints
  const baseURL = `${apiConfig.BASE_URL}/api/security/`.replace(/\/+$/, '/');
  const timestamp = new Date().toISOString();

  // Skip API calls if disabled
  if (!ENABLE_API_CALLS) {
    return {
      isConnected: false,
      baseURL,
      timestamp,
      error: 'API calls are disabled. Enable API calls in src/api/config.ts',
      databaseConnected: false,
      databaseTestResult: 'API calls disabled',
    };
  }

  try {
    const startTime = Date.now();
    
    // Test 1: Check if backend server is reachable
    // Try the login endpoint (will return 400/401 but shows server is up)
    let serverTest;
    try {
      serverTest = await axios.post(
        `${baseURL}login/`,
        { username: 'test', password: 'test' }, // Invalid credentials - will fail but shows server is reachable
        {
          timeout: 10000,
          validateStatus: (status) => status < 500, // Accept any status < 500 as "server is reachable"
        }
      );
    } catch (serverError: any) {
      // If we get a response (even error), server is reachable
      if (serverError.response) {
        serverTest = serverError.response;
      } else {
        // No response means server is down
        throw new Error('Server unreachable');
      }
    }

    const responseTime = Date.now() - startTime;
    let databaseConnected = false;
    let databaseTestResult = 'Not tested';

    // Test 2: Verify database connectivity through API
    // If server responds (even with 400/401), it means:
    // - Server is running
    // - API endpoint exists
    // - Database is accessible (because Django would return 500 if DB was down)
    if (serverTest && serverTest.status < 500) {
      const dbTestStart = Date.now();
      
      try {
        // Try login endpoint - this requires database access to check user
        // Even with wrong credentials, if we get 400/401, database is working
        const dbTestResponse = await axios.post(
          `${baseURL}login/`,
          { username: 'database_test', password: 'test' },
          {
            timeout: 10000,
            validateStatus: () => true, // Accept any status
          }
        );
        const dbTestTime = Date.now() - dbTestStart;

        // Analyze response to determine database status
        if (dbTestResponse.status === 200) {
          databaseConnected = true;
          databaseTestResult = '✅ Database connected - Login successful';
        } else if (dbTestResponse.status === 400) {
          // 400 Bad Request with "Invalid credentials" means:
          // - API is working
          // - Database is accessible (it checked the user)
          // - User doesn't exist (expected)
          const errorData = dbTestResponse.data;
          if ((errorData && errorData.non_field_errors) || (errorData && errorData.error) || (errorData && errorData.detail)) {
            databaseConnected = true;
            databaseTestResult = `✅ Database connected - API validated credentials (${dbTestResponse.status})`;
          } else {
            databaseConnected = true;
            databaseTestResult = `✅ Database connected - API responded (${dbTestResponse.status})`;
          }
        } else if (dbTestResponse.status === 401) {
          databaseConnected = true;
          databaseTestResult = `✅ Database connected - Authentication endpoint working (${dbTestResponse.status})`;
        } else if (dbTestResponse.status === 404) {
          databaseConnected = false;
          databaseTestResult = `❌ API endpoint not found (${dbTestResponse.status}) - Check API URL`;
        } else if (dbTestResponse.status >= 500) {
          databaseConnected = false;
          databaseTestResult = `❌ Server error (${dbTestResponse.status}) - Database may be down`;
        } else {
          databaseConnected = true;
          databaseTestResult = `✅ Database accessible - API responded (${dbTestResponse.status})`;
        }
      } catch (dbError: any) {
        // Analyze error to determine database status
        if (dbError.response) {
          const status = dbError.response.status;
          if (status === 400 || status === 401) {
            // These errors mean API and database are working
            databaseConnected = true;
            databaseTestResult = `✅ Database connected - API error response (${status}) indicates DB is accessible`;
          } else if (status >= 500) {
            databaseConnected = false;
            databaseTestResult = `❌ Server/Database error (${status}) - Database may be down`;
          } else {
            databaseConnected = false;
            databaseTestResult = `⚠️ API error (${status}) - Status unclear`;
          }
        } else if (dbError.request) {
          databaseConnected = false;
          databaseTestResult = '❌ No response from database endpoint - Network issue';
        } else {
          databaseConnected = false;
          databaseTestResult = `❌ Database test failed: ${dbError.message}`;
        }
      }
    }

    return {
      isConnected: true,
      baseURL,
      responseTime,
      statusCode: serverTest && serverTest.status ? serverTest.status : undefined,
      databaseConnected,
      databaseTestResult,
      apiEndpoint: `${baseURL}login/`,
      timestamp,
    };
  } catch (error: any) {
    let errorMessage = 'Unknown error';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response from server - server may be down or unreachable';
    } else {
      // Error setting up request
      errorMessage = error.message || 'Connection failed';
    }

    return {
      isConnected: false,
      baseURL,
      error: errorMessage,
      databaseConnected: false,
      databaseTestResult: 'Cannot test database - Backend server unreachable',
      apiEndpoint: `${baseURL}login/`,
      timestamp,
    };
  }
};

/**
 * Test connection with a simple ping-like request
 * This is a lighter test that just checks if the server is reachable
 */
export const pingServer = async (): Promise<boolean> => {
  try {
    const baseURL = `${apiConfig.BASE_URL}/api/security/`;
    const response = await axios.post(
      `${baseURL}login/`,
      { username: 'ping', password: 'test' },
      {
        timeout: 5000,
        validateStatus: () => true, // Accept any status
      }
    );
    // If we get any response (even 400/401/404), server is reachable
    return response.status < 500;
  } catch (error: any) {
    // If we got a response (even error), server is reachable
    if (error.response) {
      return error.response.status < 500;
    }
    // Network error or timeout means server is not reachable
    return false;
  }
};

/**
 * Get current API configuration
 */
export const getAPIConfig = () => {
    const baseURL = `${apiConfig.BASE_URL}/api/security`;
    return {
      baseURL,
      socketURL: `wss://${apiConfig.BASE_URL.replace('https://', '').replace('http://', '')}/ws/`,
    };
};

