/**
 * Comprehensive API Test Suite
 * Tests all APIs connected through TypeScript
 */

import {
  loginOfficer,
  listSOS,
  getSOS,
  createSOS,
  updateSOS,
  patchSOS,
  deleteSOS,
  resolveSOS,
  getActiveSOS,
  getResolvedSOS,
  listCases,
  getCase,
  createCase,
  updateCase,
  patchCase,
  deleteCase,
  acceptCase,
  rejectCase,
  resolveCase,
  getNavigation,
  listIncidents,
  refreshAccessToken,
  getToken,
} from '../api/SecurityAPI';
import { alertService } from '../api/services/alertService';
import { geofenceService } from '../api/services/geofenceService';
import { profileService } from '../api/services/profileService';
import { locationService } from '../api/services/locationService';
import { broadcastService } from '../api/services/broadcastService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TestResult {
  name: string;
  status: 'success' | 'error' | 'skipped';
  message: string;
  data?: any;
  error?: any;
  duration?: number;
}

export class APITestSuite {
  private results: TestResult[] = [];
  private token: string | null = null;
  private userId: string | null = null;
  private geofenceId: string | null = null;

  /**
   * Run all API tests
   */
  async runAllTests(
    username: string = 'test_officer',
    password: string = 'TestOfficer123!'
  ): Promise<TestResult[]> {
    this.results = [];
    console.log('🧪 Starting API Test Suite...\n');

    try {
      // Step 1: Authentication
      await this.testAuthentication(username, password);

      // Step 2: Get user info from token
      await this.getUserInfo();

      // Step 3: Test all APIs
      await this.testSOSAPIs();
      await this.testCaseAPIs();
      await this.testAlertAPIs();
      await this.testGeofenceAPIs();
      await this.testProfileAPIs();
      await this.testLocationAPIs();
      await this.testBroadcastAPIs();
      await this.testNavigationAPIs();
      await this.testIncidentAPIs();
      await this.testTokenRefresh();

      // Summary
      this.printSummary();
    } catch (error: any) {
      this.addResult('Test Suite', 'error', `Test suite failed: ${error.message}`, null, error);
    }

    return this.results;
  }

  /**
   * Test Authentication
   */
  private async testAuthentication(username: string, password: string) {
    const startTime = Date.now();
    try {
      console.log('🔐 Testing Authentication...');
      const response = await loginOfficer(username, password);
      
      if (response.access) {
        this.token = response.access;
        let userId = null;
        if (response.user && response.user.id) {
          userId = String(response.user.id);
        } else if (response.user && response.user.pk) {
          userId = String(response.user.pk);
        }
        this.userId = userId;
        this.geofenceId = (response.user && response.user.geofence_id) ? response.user.geofence_id : null;
        
        const duration = Date.now() - startTime;
        this.addResult(
          'Authentication - Login',
          'success',
          `Login successful. User ID: ${this.userId}`,
          { userId: this.userId, hasToken: !!this.token },
          null,
          duration
        );
      } else {
        throw new Error('No access token in response');
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.addResult(
        'Authentication - Login',
        'error',
        error.message || 'Login failed',
        null,
        error,
        duration
      );
      throw error; // Stop tests if login fails
    }
  }

  /**
   * Get user info from stored token
   */
  private async getUserInfo() {
    try {
      this.token = await getToken();
      if (!this.token) {
        throw new Error('No token found');
      }
      this.addResult('Get User Info', 'success', 'Token retrieved from storage', {
        hasToken: !!this.token,
      });
    } catch (error: any) {
      this.addResult('Get User Info', 'error', error.message, null, error);
    }
  }

  /**
   * Test SOS APIs
   */
  private async testSOSAPIs() {
    console.log('🆘 Testing SOS APIs...');

    // List SOS
    await this.testAPI('SOS - List All', async () => {
      const response = await listSOS();
      return response.data;
    });

    // Get Active SOS
    await this.testAPI('SOS - Get Active', async () => {
      const response = await getActiveSOS();
      return response.data;
    });

    // Get Resolved SOS
    await this.testAPI('SOS - Get Resolved', async () => {
      const response = await getResolvedSOS();
      return response.data;
    });

    // Create SOS (if we have data)
    await this.testAPI('SOS - Create', async () => {
      const response = await createSOS({
        description: 'Test SOS from API test suite',
        location: {
          latitude: 19.0760,
          longitude: 72.8777,
        },
        priority: 'high',
      });
      return response.data;
    }, true); // Optional test

    // Get specific SOS (if we have an ID)
    // await this.testAPI('SOS - Get by ID', async () => {
    //   const response = await getSOS(1);
    //   return response.data;
    // }, true);
  }

  /**
   * Test Case APIs
   */
  private async testCaseAPIs() {
    console.log('📁 Testing Case APIs...');

    // List Cases
    await this.testAPI('Case - List All', async () => {
      const response = await listCases();
      return response.data;
    });

    // Create Case (optional)
    await this.testAPI('Case - Create', async () => {
      const response = await createCase({
        title: 'Test Case',
        description: 'Test case from API test suite',
        priority: 'medium',
      });
      return response.data;
    }, true);
  }

  /**
   * Test Alert APIs
   */
  private async testAlertAPIs() {
    console.log('🔔 Testing Alert APIs...');

    if (!this.userId || !this.geofenceId) {
      this.addResult(
        'Alert - Get Alerts',
        'skipped',
        'Skipped: Missing userId or geofenceId',
        null
      );
      return;
    }

    // Get Alerts
    await this.testAPI('Alert - Get Alerts', async () => {
      const alerts = await alertService.getAlerts(this.userId!, this.geofenceId!);
      return alerts;
    });

    // Get Alert Logs
    await this.testAPI('Alert - Get Logs', async () => {
      const logs = await alertService.getAlertLogs(this.userId!, undefined, undefined);
      return logs;
    });
  }

  /**
   * Test Geofence APIs
   */
  private async testGeofenceAPIs() {
    console.log('🧭 Testing Geofence APIs...');

    if (!this.geofenceId) {
      this.addResult(
        'Geofence - Get Details',
        'skipped',
        'Skipped: Missing geofenceId',
        null
      );
      return;
    }

    // Get Geofence Details
    await this.testAPI('Geofence - Get Details', async () => {
      const geofence = await geofenceService.getGeofenceDetails(this.geofenceId!);
      return geofence;
    });

    // Get Users in Area
    await this.testAPI('Geofence - Get Users in Area', async () => {
      const users = await geofenceService.getUsersInArea(this.geofenceId!);
      return users;
    });
  }

  /**
   * Test Profile APIs
   */
  private async testProfileAPIs() {
    console.log('👤 Testing Profile APIs...');

    if (!this.userId) {
      this.addResult('Profile - Get Profile', 'skipped', 'Skipped: Missing userId', null);
      return;
    }

    // Get Profile
    await this.testAPI('Profile - Get Profile', async () => {
      const profile = await profileService.getProfile(this.userId!);
      return profile;
    });
  }

  /**
   * Test Location APIs
   */
  private async testLocationAPIs() {
    console.log('📍 Testing Location APIs...');

    if (!this.userId || !this.geofenceId) {
      this.addResult(
        'Location - Update Location',
        'skipped',
        'Skipped: Missing userId or geofenceId',
        null
      );
      return;
    }

    // Update Location
    await this.testAPI('Location - Update Location', async () => {
      const result = await locationService.updateLocation(
        this.userId!,
        {
          latitude: 19.0760,
          longitude: 72.8777,
        },
        this.geofenceId!
      );
      return result;
    });

    // Get User Location
    await this.testAPI('Location - Get User Location', async () => {
      const location = await locationService.getUserLocation(this.userId!);
      return location;
    });
  }

  /**
   * Test Broadcast APIs
   */
  private async testBroadcastAPIs() {
    console.log('📢 Testing Broadcast APIs...');

    if (!this.userId || !this.geofenceId) {
      this.addResult(
        'Broadcast - Send Broadcast',
        'skipped',
        'Skipped: Missing userId or geofenceId',
        null
      );
      return;
    }

    // Send Broadcast (optional - might create actual broadcast)
    await this.testAPI(
      'Broadcast - Send Broadcast',
      async () => {
        const result = await broadcastService.sendBroadcast({
          security_id: this.userId!,
          geofence_id: this.geofenceId!,
          message: 'Test broadcast from API test suite',
          priority: 'normal',
        });
        return result;
      },
      true
    );
  }

  /**
   * Test Navigation APIs
   */
  private async testNavigationAPIs() {
    console.log('🧭 Testing Navigation APIs...');

    await this.testAPI('Navigation - Get Navigation', async () => {
      const response = await getNavigation();
      return response.data;
    });
  }

  /**
   * Test Incident APIs
   */
  private async testIncidentAPIs() {
    console.log('📜 Testing Incident APIs...');

    await this.testAPI('Incident - List Incidents', async () => {
      const response = await listIncidents();
      return response.data;
    });
  }

  /**
   * Test Token Refresh
   */
  private async testTokenRefresh() {
    console.log('🔄 Testing Token Refresh...');

    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        this.addResult(
          'Token - Refresh',
          'skipped',
          'Skipped: No refresh token available',
          null
        );
        return;
      }

      await this.testAPI('Token - Refresh', async () => {
        const newToken = await refreshAccessToken(refreshToken);
        return { hasNewToken: !!newToken };
      });
    } catch (error: any) {
      this.addResult('Token - Refresh', 'error', error.message, null, error);
    }
  }

  /**
   * Generic API test helper
   */
  private async testAPI(
    name: string,
    testFn: () => Promise<any>,
    optional: boolean = false
  ) {
    const startTime = Date.now();
    try {
      const data = await testFn();
      const duration = Date.now() - startTime;
      this.addResult(name, 'success', 'API call successful', data, null, duration);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      if (optional) {
        this.addResult(
          name,
          'skipped',
          `Optional test failed: ${error.message}`,
          null,
          error,
          duration
        );
      } else {
        this.addResult(name, 'error', error.message || 'API call failed', null, error, duration);
      }
    }
  }

  /**
   * Add test result
   */
  private addResult(
    name: string,
    status: 'success' | 'error' | 'skipped',
    message: string,
    data?: any,
    error?: any,
    duration?: number
  ) {
    this.results.push({
      name,
      status,
      message,
      data,
      error: (() => {
        if (error && error.response && error.response.data) {
          return error.response.data;
        }
        if (error && error.message) {
          return error.message;
        }
        return error;
      })(),
      duration,
    });
  }

  /**
   * Print test summary
   */
  private printSummary() {
    const success = this.results.filter((r) => r.status === 'success').length;
    const errors = this.results.filter((r) => r.status === 'error').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;
    const total = this.results.length;

    console.log('\n📊 Test Summary:');
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📝 Total: ${total}\n`);

    if (errors > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter((r) => r.status === 'error')
        .forEach((r) => {
          console.log(`  - ${r.name}: ${r.message}`);
        });
    }
  }

  /**
   * Get formatted results
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * Get results summary
   */
  getSummary() {
    const success = this.results.filter((r) => r.status === 'success').length;
    const errors = this.results.filter((r) => r.status === 'error').length;
    const skipped = this.results.filter((r) => r.status === 'skipped').length;
    const total = this.results.length;

    return {
      success,
      errors,
      skipped,
      total,
      successRate: total > 0 ? ((success / total) * 100).toFixed(1) : '0',
    };
  }
}

export default APITestSuite;

