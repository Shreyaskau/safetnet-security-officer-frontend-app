/**
 * Geofence Data Mapping
 * 
 * This file contains geofence coordinates for known geofences.
 * When the backend geofence API is not available, this mapping is used as fallback.
 * 
 * To add a new geofence:
 * 1. Get the actual coordinates from your backend/database
 * 2. Add an entry here with the geofence name as key
 * 3. Include polygon coordinates (array of {latitude, longitude})
 */

import { GeofenceArea } from '../types/location.types';

export const GEOFENCE_DATA_MAP: Record<string, GeofenceArea> = {
  // "jay ganesh vision" geofence
  // Coordinates based on user location (18.647, 73.784) - UPDATE with actual coordinates from backend
  'jay ganesh vision': {
    geofence_id: 'jay-ganesh-vision',
    name: 'jay ganesh vision',
    description: 'Jay Ganesh Vision Geofence Area',
    center: {
      latitude: 18.647, // Based on user's current location - UPDATE with actual center
      longitude: 73.784,
    },
    coordinates: [
      // Square polygon around the center point - REPLACE with actual polygon coordinates from backend
      // These are approximate coordinates - get actual polygon from backend/database
      { latitude: 18.657, longitude: 73.774 }, // Northwest
      { latitude: 18.657, longitude: 73.794 }, // Northeast
      { latitude: 18.637, longitude: 73.794 }, // Southeast
      { latitude: 18.637, longitude: 73.774 }, // Southwest
    ],
    radius: 1500, // 1.5km radius - UPDATE with actual radius
    active_users_count: 0,
    area_size: 2.25, // km² - UPDATE with actual area
  },
  
  // Add more geofences here as needed
  'Pune PCMC Area': {
    geofence_id: 'pune-pcmc',
    name: 'Pune PCMC Area',
    description: 'Pune PCMC Security Zone',
    center: {
      latitude: 18.5204,
      longitude: 73.8567,
    },
    coordinates: [
      { latitude: 18.5404, longitude: 73.8367 },
      { latitude: 18.5404, longitude: 73.8767 },
      { latitude: 18.5004, longitude: 73.8767 },
      { latitude: 18.5004, longitude: 73.8367 },
    ],
    radius: 3000,
    active_users_count: 0,
    area_size: 9.0,
  },
};

/**
 * Get geofence data by name (case-insensitive)
 */
export const getGeofenceByName = (name: string): GeofenceArea | null => {
  if (!name) return null;
  
  // Try exact match first
  if (GEOFENCE_DATA_MAP[name]) {
    return GEOFENCE_DATA_MAP[name];
  }
  
  // Try case-insensitive match
  const lowerName = name.toLowerCase().trim();
  for (const [key, value] of Object.entries(GEOFENCE_DATA_MAP)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(GEOFENCE_DATA_MAP)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
};

