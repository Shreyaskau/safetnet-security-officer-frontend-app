import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { requestNotificationPermission } from '../utils/permissions';

export class NotificationService {
  private fcmToken: string | null = null;

  async initialize() {
    try {
      // Request permission
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        console.warn('Notification permission denied');
        return;
      }

      // Get FCM token
      this.fcmToken = await messaging().getToken();
      console.log('FCM Token:', this.fcmToken);

      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message:', remoteMessage);
        // You can show a local notification here
      });

      // Handle background messages
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background message:', remoteMessage);
      });

      // Handle notification taps
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification opened app:', remoteMessage);
      });

      // Check if app was opened from a notification
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log('App opened from notification:', remoteMessage);
          }
        });
    } catch (error) {
      console.error('Notification service initialization error:', error);
    }
  }

  getToken(): string | null {
    return this.fcmToken;
  }

  async requestPermission(): Promise<boolean> {
    return await requestNotificationPermission();
  }

  onTokenRefresh(callback: (token: string) => void) {
    messaging().onTokenRefresh((token) => {
      this.fcmToken = token;
      callback(token);
    });
  }
}

export const notificationService = new NotificationService();












