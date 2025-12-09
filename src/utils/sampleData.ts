import { Alert } from '../types/alert.types';

/**
 * Sample Alerts Data
 */
export const getSampleAlerts = (): Alert[] => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return [
    {
      id: 'alert-1',
      log_id: 'log-1',
      user_id: 'user-1',
      user_name: 'John Doe',
      user_email: 'john.doe@example.com',
      user_phone: '+1234567890',
      alert_type: 'emergency',
      priority: 'high',
      message: 'Medical emergency in Building A, Room 205. Immediate assistance required.',
      location: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: '123 Main Street, Building A, Room 205',
      },
      distance: 0.5,
      timestamp: oneHourAgo.toISOString(),
      status: 'pending',
      geofence_id: 'GEO001',
      created_at: oneHourAgo.toISOString(),
    },
    {
      id: 'alert-2',
      log_id: 'log-2',
      user_id: 'user-2',
      user_name: 'Jane Smith',
      user_email: 'jane.smith@example.com',
      user_phone: '+1234567891',
      alert_type: 'normal',
      priority: 'medium',
      message: 'Suspicious activity reported near the parking lot. Please investigate.',
      location: {
        latitude: 19.0780,
        longitude: 72.8790,
        address: 'Parking Lot B, Near Entrance',
      },
      distance: 0.8,
      timestamp: twoHoursAgo.toISOString(),
      status: 'accepted',
      geofence_id: 'GEO001',
      created_at: twoHoursAgo.toISOString(),
      updated_at: oneHourAgo.toISOString(),
    },
    {
      id: 'alert-3',
      log_id: 'log-3',
      user_id: 'user-3',
      user_name: 'Mike Johnson',
      user_email: 'mike.johnson@example.com',
      user_phone: '+1234567892',
      alert_type: 'normal',
      priority: 'low',
      message: 'Lost and found item reported at reception desk.',
      location: {
        latitude: 19.0740,
        longitude: 72.8750,
        address: 'Main Reception, Ground Floor',
      },
      distance: 1.2,
      timestamp: threeHoursAgo.toISOString(),
      status: 'pending',
      geofence_id: 'GEO001',
      created_at: threeHoursAgo.toISOString(),
    },
    {
      id: 'alert-4',
      log_id: 'log-4',
      user_id: 'user-4',
      user_name: 'Sarah Williams',
      user_email: 'sarah.williams@example.com',
      user_phone: '+1234567893',
      alert_type: 'emergency',
      priority: 'high',
      message: 'Fire alarm activated in Building C. Evacuation in progress.',
      location: {
        latitude: 19.0800,
        longitude: 72.8800,
        address: 'Building C, 3rd Floor',
      },
      distance: 0.3,
      timestamp: now.toISOString(),
      status: 'pending',
      geofence_id: 'GEO001',
      created_at: now.toISOString(),
    },
    {
      id: 'alert-5',
      log_id: 'log-5',
      user_id: 'user-5',
      user_name: 'David Brown',
      user_email: 'david.brown@example.com',
      user_phone: '+1234567894',
      alert_type: 'normal',
      priority: 'medium',
      message: 'Access card issue - visitor unable to enter main gate.',
      location: {
        latitude: 19.0720,
        longitude: 72.8740,
        address: 'Main Gate, Security Booth',
      },
      distance: 1.5,
      timestamp: yesterday.toISOString(),
      status: 'completed',
      geofence_id: 'GEO001',
      created_at: yesterday.toISOString(),
      updated_at: oneHourAgo.toISOString(),
    },
    {
      id: 'alert-6',
      log_id: 'log-6',
      user_id: 'user-6',
      user_name: 'Emily Davis',
      user_email: 'emily.davis@example.com',
      user_phone: '+1234567895',
      alert_type: 'normal',
      priority: 'low',
      message: 'Noise complaint from apartment 3B. Please check.',
      location: {
        latitude: 19.0770,
        longitude: 72.8780,
        address: 'Residential Block, Apartment 3B',
      },
      distance: 0.6,
      timestamp: twoHoursAgo.toISOString(),
      status: 'accepted',
      geofence_id: 'GEO001',
      created_at: twoHoursAgo.toISOString(),
      updated_at: oneHourAgo.toISOString(),
    },
  ];
};

/**
 * Sample Logs Data
 */
export const getSampleLogs = (): Alert[] => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'log-1',
      log_id: 'log-1',
      user_id: 'user-1',
      user_name: 'John Doe',
      user_email: 'john.doe@example.com',
      user_phone: '+1234567890',
      alert_type: 'emergency',
      priority: 'high',
      message: 'Medical emergency resolved. Patient transported to hospital.',
      location: {
        latitude: 19.0760,
        longitude: 72.8777,
        address: 'Building A, Room 205',
      },
      distance: 0.5,
      timestamp: oneDayAgo.toISOString(),
      status: 'completed',
      geofence_id: 'GEO001',
      created_at: oneDayAgo.toISOString(),
      updated_at: oneDayAgo.toISOString(),
    },
    {
      id: 'log-2',
      log_id: 'log-2',
      user_id: 'user-2',
      user_name: 'Jane Smith',
      user_email: 'jane.smith@example.com',
      user_phone: '+1234567891',
      alert_type: 'normal',
      priority: 'medium',
      message: 'Suspicious activity investigated. False alarm - maintenance work.',
      location: {
        latitude: 19.0780,
        longitude: 72.8790,
        address: 'Parking Lot B',
      },
      distance: 0.8,
      timestamp: twoDaysAgo.toISOString(),
      status: 'completed',
      geofence_id: 'GEO001',
      created_at: twoDaysAgo.toISOString(),
      updated_at: twoDaysAgo.toISOString(),
    },
    {
      id: 'log-3',
      log_id: 'log-3',
      user_id: 'user-3',
      user_name: 'Mike Johnson',
      user_email: 'mike.johnson@example.com',
      user_phone: '+1234567892',
      alert_type: 'emergency',
      priority: 'high',
      message: 'Fire alarm - Building evacuated. All clear after inspection.',
      location: {
        latitude: 19.0800,
        longitude: 72.8800,
        address: 'Building C',
      },
      distance: 0.3,
      timestamp: threeDaysAgo.toISOString(),
      status: 'completed',
      geofence_id: 'GEO001',
      created_at: threeDaysAgo.toISOString(),
      updated_at: threeDaysAgo.toISOString(),
    },
    {
      id: 'log-4',
      log_id: 'log-4',
      user_id: 'user-4',
      user_name: 'Sarah Williams',
      user_email: 'sarah.williams@example.com',
      user_phone: '+1234567893',
      alert_type: 'normal',
      priority: 'low',
      message: 'Lost item claimed by owner. Case closed.',
      location: {
        latitude: 19.0740,
        longitude: 72.8750,
        address: 'Main Reception',
      },
      distance: 1.2,
      timestamp: fourDaysAgo.toISOString(),
      status: 'completed',
      geofence_id: 'GEO001',
      created_at: fourDaysAgo.toISOString(),
      updated_at: fourDaysAgo.toISOString(),
    },
    {
      id: 'log-5',
      log_id: 'log-5',
      user_id: 'user-5',
      user_name: 'David Brown',
      user_email: 'david.brown@example.com',
      user_phone: '+1234567894',
      alert_type: 'normal',
      priority: 'medium',
      message: 'Access card issue resolved. Temporary pass issued.',
      location: {
        latitude: 19.0720,
        longitude: 72.8740,
        address: 'Main Gate',
      },
      distance: 1.5,
      timestamp: fiveDaysAgo.toISOString(),
      status: 'completed',
      geofence_id: 'GEO001',
      created_at: fiveDaysAgo.toISOString(),
      updated_at: fiveDaysAgo.toISOString(),
    },
  ];
};

/**
 * Sample Officer Stats
 */
export const getSampleStats = () => {
  return {
    total_responses: 156,
    avg_response_time: 3.2, // minutes
    active_hours: 240,
    area_coverage: 8.5, // percentage
    rating: 4.8,
  };
};

