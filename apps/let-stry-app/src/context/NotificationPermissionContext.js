import React, { createContext, useEffect, useState, useContext, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const NotificationPermissionContext = createContext();

export const NotificationPermissionProvider = ({ children }) => {
  const [permissionGranted, setPermissionGranted] = useState(null); // null = unknown
  const requestedRef = useRef(false); // Prevent multiple requests in same session

  useEffect(() => {
    const checkPermission = async () => {
      if (requestedRef.current) return; // avoid duplicate triggers
      requestedRef.current = true;

      try {
        const alreadyAsked = await AsyncStorage.getItem('notif_permission_requested');

        if (!alreadyAsked) {
          let granted = false;

          if (Platform.OS === 'android' && Platform.Version >= 33) {
            const result = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            granted = (result === PermissionsAndroid.RESULTS.GRANTED);
          } 
          else if (Platform.OS === 'ios') {
            const authStatus = await messaging().requestPermission();
            granted =
              authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL;
          } 
          else {
            // Below Android 13 — permissions auto-granted
            granted = true;
          }

          // Save the fact that we have already asked, regardless of result
          await AsyncStorage.setItem('notif_permission_requested', 'true');
          setPermissionGranted(granted);
        } 
        else {
          // We've already asked before — just check current status
          if (Platform.OS === 'android' && Platform.Version >= 33) {
            const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
            setPermissionGranted(status);
          } 
          else if (Platform.OS === 'ios') {
            const authStatus = await messaging().hasPermission();
            setPermissionGranted(
              authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
              authStatus === messaging.AuthorizationStatus.PROVISIONAL
            );
          } 
          else {
            setPermissionGranted(true);
          }
        }
      } catch (err) {
        console.warn('Notification permission request error:', err);
        setPermissionGranted(false);
      }
    };

    // Slight delay ensures it won't collide with other first-launch permission modals (like location)
    const timer = setTimeout(checkPermission, 500);
    return () => clearTimeout(timer);

  }, []);

  return (
    <NotificationPermissionContext.Provider value={{ permissionGranted }}>
      {children}
    </NotificationPermissionContext.Provider>
  );
};

export const useNotificationPermission = () => useContext(NotificationPermissionContext);
