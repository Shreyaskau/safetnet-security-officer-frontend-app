import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { requestNotificationPermission } from '../utils/permissions';
import { notificationService } from '../services/NotificationService';

export const usePushNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [initialNotification, setInitialNotification] = useState<any>(null);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Request permission
      const permission = await requestNotificationPermission();
      setHasPermission(permission);

      if (!permission) {
        console.warn('Notification permission denied');
        return;
      }

      // Get FCM token
      const token = await messaging().getToken();
      setFcmToken(token);
      console.log('FCM Token:', token);

      // Handle foreground messages
      const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message:', remoteMessage);
        
        // Show local notification
        if (remoteMessage.notification) {
          Alert.alert(
            remoteMessage.notification.title || 'New Alert',
            remoteMessage.notification.body || '',
            [{ text: 'OK' }]
          );
        }
      });

      // Handle notification taps when app is in background
      const unsubscribeBackground = messaging().onNotificationOpenedApp(
        (remoteMessage) => {
          console.log('Notification opened app:', remoteMessage);
          setInitialNotification(remoteMessage);
        }
      );

      // Check if app was opened from a notification
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log('App opened from notification:', remoteMessage);
            setInitialNotification(remoteMessage);
          }
        });

      // Handle token refresh
      const unsubscribeTokenRefresh = messaging().onTokenRefresh((token) => {
        console.log('FCM token refreshed:', token);
        setFcmToken(token);
      });

      return () => {
        unsubscribeForeground();
        unsubscribeBackground();
        unsubscribeTokenRefresh();
      };
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setHasPermission(permission);
    if (permission) {
      const token = await messaging().getToken();
      setFcmToken(token);
    }
    return permission;
  };

  return {
    fcmToken,
    hasPermission,
    initialNotification,
    requestPermission,
  };
};












