import { Platform, PermissionsAndroid } from 'react-native';
import { request, PERMISSIONS, RESULTS, Permission, checkNotifications, requestNotifications } from 'react-native-permissions';

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      // First check if permission is already granted
      const checkResult = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (checkResult) {
        return true;
      }

      // Request permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'SafeTNet needs access to your location to send alerts and track your position',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      
      // If fine location granted, also request coarse location for compatibility
      if (isGranted) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          {
            title: 'Location Permission',
            message: 'SafeTNet also needs approximate location access',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
      }
      
      return isGranted;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  } else {
    const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return result === RESULTS.GRANTED;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'SafeTNet needs to send you emergency alerts',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  } else {
    // iOS notifications use checkNotifications/requestNotifications, not PERMISSIONS.IOS.NOTIFICATIONS
    const { status } = await requestNotifications(['alert', 'sound', 'badge']);
    return status === RESULTS.GRANTED;
  }
};














