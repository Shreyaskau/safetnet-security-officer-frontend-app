import { LoginResponse, SecurityOfficer } from '../types/user.types';
import { GeofenceArea } from '../types/location.types';

// Mock officer credentials database
export const MOCK_OFFICERS = {
  // Badge ID: BADGE001
  BADGE001: {
    password: 'officer123',
    officer: {
      security_id: 'SEC001',
      name: 'John Smith',
      email_id: 'john.smith@safetnet.com',
      mobile: '+1234567890',
      security_role: 'guard' as const,
      geofence_id: 'GEO001',
      user_image: undefined,
      status: 'active' as const,
      badge_number: 'BADGE001',
      shift_schedule: 'Morning Shift (6 AM - 2 PM)',
      stats: {
        total_responses: 45,
        avg_response_time: 3.5,
        active_hours: 120,
        area_coverage: 5.2,
        rating: 4.8,
      },
    },
  },
  // Email: officer@safetnet.com
  'officer@safetnet.com': {
    password: 'securepass456',
    officer: {
      security_id: 'SEC002',
      name: 'Sarah Johnson',
      email_id: 'officer@safetnet.com',
      mobile: '+1234567891',
      security_role: 'supervisor' as const,
      geofence_id: 'GEO002',
      user_image: undefined,
      status: 'active' as const,
      badge_number: 'BADGE002',
      shift_schedule: 'Evening Shift (2 PM - 10 PM)',
      stats: {
        total_responses: 128,
        avg_response_time: 2.8,
        active_hours: 240,
        area_coverage: 8.5,
        rating: 4.9,
      },
    },
  },
  // Badge ID: SO-2024-001
  'SO-2024-001': {
    password: 'test1234',
    officer: {
      security_id: 'SEC003',
      name: 'Michael Brown',
      email_id: 'michael.brown@safetnet.com',
      mobile: '+1234567892',
      security_role: 'guard' as const,
      geofence_id: 'GEO003',
      user_image: undefined,
      status: 'active' as const,
      badge_number: 'SO-2024-001',
      shift_schedule: 'Night Shift (10 PM - 6 AM)',
      stats: {
        total_responses: 67,
        avg_response_time: 4.2,
        active_hours: 180,
        area_coverage: 6.8,
        rating: 4.6,
      },
    },
  },
  // Email: security.officer@safetnet.com
  'security.officer@safetnet.com': {
    password: 'password123',
    officer: {
      security_id: 'SEC004',
      name: 'Emily Davis',
      email_id: 'security.officer@safetnet.com',
      mobile: '+1234567893',
      security_role: 'admin' as const,
      geofence_id: 'GEO001',
      user_image: undefined,
      status: 'active' as const,
      badge_number: 'BADGE003',
      shift_schedule: 'Day Shift (8 AM - 4 PM)',
      stats: {
        total_responses: 203,
        avg_response_time: 2.1,
        active_hours: 320,
        area_coverage: 12.5,
        rating: 5.0,
      },
    },
  },
  // Badge ID: 12345
  '12345': {
    password: 'demo2024',
    officer: {
      security_id: 'SEC005',
      name: 'David Wilson',
      email_id: 'david.wilson@safetnet.com',
      mobile: '+1234567894',
      security_role: 'guard' as const,
      geofence_id: 'GEO002',
      user_image: undefined,
      status: 'active' as const,
      badge_number: '12345',
      shift_schedule: 'Flexible Shift',
      stats: {
        total_responses: 32,
        avg_response_time: 5.1,
        active_hours: 95,
        area_coverage: 4.3,
        rating: 4.5,
      },
    },
  },
  // Badge ID: BADGE006 - New Officer
  BADGE006: {
    password: 'SecurePass2024!',
    officer: {
      security_id: 'SEC006',
      name: 'Robert Anderson',
      email_id: 'robert.anderson@safetnet.com',
      mobile: '+1234567895',
      security_role: 'guard' as const,
      geofence_id: 'GEO001',
      user_image: undefined,
      status: 'active' as const,
      badge_number: 'BADGE006',
      shift_schedule: 'Day Shift (8 AM - 4 PM)',
      stats: {
        total_responses: 89,
        avg_response_time: 3.8,
        active_hours: 200,
        area_coverage: 7.5,
        rating: 4.7,
      },
    },
  },
  // Email: robert.anderson@safetnet.com
  'robert.anderson@safetnet.com': {
    password: 'SecurePass2024!',
    officer: {
      security_id: 'SEC006',
      name: 'Robert Anderson',
      email_id: 'robert.anderson@safetnet.com',
      mobile: '+1234567895',
      security_role: 'guard' as const,
      geofence_id: 'GEO001',
      user_image: undefined,
      status: 'active' as const,
      badge_number: 'BADGE006',
      shift_schedule: 'Day Shift (8 AM - 4 PM)',
      stats: {
        total_responses: 89,
        avg_response_time: 3.8,
        active_hours: 200,
        area_coverage: 7.5,
        rating: 4.7,
      },
    },
  },
};

// Mock login function
export const mockLogin = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Normalize email/badge ID (case insensitive)
  const normalizedKey = email.trim().toUpperCase();

  // Try to find officer by badge ID or email
  const officerData =
    MOCK_OFFICERS[normalizedKey as keyof typeof MOCK_OFFICERS] ||
    MOCK_OFFICERS[email.toLowerCase() as keyof typeof MOCK_OFFICERS];

  if (!officerData) {
    return {
      result: 'failed',
      role: 'security',
      msg: 'Invalid badge ID or email',
    };
  }

  if (officerData.password !== password) {
    return {
      result: 'failed',
      role: 'security',
      msg: 'Invalid password',
    };
  }

  // Success response
  return {
    result: 'success',
    role: 'security',
    security_id: officerData.officer.security_id,
    name: officerData.officer.name,
    email_id: officerData.officer.email_id,
    mobile: officerData.officer.mobile,
    security_role: officerData.officer.security_role,
    geofence_id: officerData.officer.geofence_id,
    user_image: officerData.officer.user_image,
    status: officerData.officer.status,
    msg: 'Login successful',
  };
};

// Get mock officer data
export const getMockOfficer = (emailOrBadge: string): SecurityOfficer | null => {
  const normalizedKey = emailOrBadge.trim().toUpperCase();
  const officerData =
    MOCK_OFFICERS[normalizedKey as keyof typeof MOCK_OFFICERS] ||
    MOCK_OFFICERS[emailOrBadge.toLowerCase() as keyof typeof MOCK_OFFICERS];

  return officerData ? officerData.officer : null;
};

// Mock geofence data (only used when ENABLE_API_CALLS is false)
const MOCK_GEOFENCES: Record<string, GeofenceArea> = {
  GEO001: {
    geofence_id: 'GEO001',
    name: 'Downtown Security Zone',
    description: 'Main downtown area with high foot traffic',
    center: {
      latitude: 19.0760,
      longitude: 72.8777,
    },
    coordinates: [
      { latitude: 19.0800, longitude: 72.8700 },
      { latitude: 19.0800, longitude: 72.8850 },
      { latitude: 19.0720, longitude: 72.8850 },
      { latitude: 19.0720, longitude: 72.8700 },
    ],
    radius: 1500,
    active_users_count: 45,
    area_size: 2.3,
  },
  GEO002: {
    geofence_id: 'GEO002',
    name: 'Residential Complex Area',
    description: 'Residential complex with multiple buildings',
    center: {
      latitude: 19.0850,
      longitude: 72.8900,
    },
    coordinates: [
      { latitude: 19.0900, longitude: 72.8800 },
      { latitude: 19.0900, longitude: 72.9000 },
      { latitude: 19.0800, longitude: 72.9000 },
      { latitude: 19.0800, longitude: 72.8800 },
    ],
    radius: 1200,
    active_users_count: 32,
    area_size: 1.8,
  },
  GEO003: {
    geofence_id: 'GEO003',
    name: 'Commercial District',
    description: 'Commercial area with shops and offices',
    center: {
      latitude: 19.0700,
      longitude: 72.8600,
    },
    coordinates: [
      { latitude: 19.0750, longitude: 72.8500 },
      { latitude: 19.0750, longitude: 72.8700 },
      { latitude: 19.0650, longitude: 72.8700 },
      { latitude: 19.0650, longitude: 72.8500 },
    ],
    radius: 1000,
    active_users_count: 28,
    area_size: 1.5,
  },
};

// Mock geofence function (only used when ENABLE_API_CALLS is false)
export const getMockGeofence = async (geofenceId: string): Promise<GeofenceArea> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const geofence = MOCK_GEOFENCES[geofenceId];
  if (!geofence) {
    throw new Error(`Geofence ${geofenceId} not found`);
  }
  
  return geofence;
};

