import * as Device from 'expo-device';
import Constants from 'expo-constants';
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
import {useState,useEffect,useRef} from 'react'
import {Alert} from 'react-native'
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../NotificationProvider';
import notifee from '@notifee/react-native'

export default function PushNotification(){

    const navigation = useNavigation();
    const {showNotification} = useNotification();

    const requestUserPermission = async () => {
      await messaging().registerDeviceForRemoteMessages();
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    };

    useEffect(() => {
      if (requestUserPermission()){
        const token = messaging().getToken()
        return token 
      }
      }, []);

    // Handle user clicking on a notification and open the screen
    const handleNotificationClick = async (response) => {
      const screen = response?.notification?.request?.content?.data?.screen;
      if (screen !== null) {
        navigation.navigate(screen);
      }
    };

    // Listen for user clicking on a notification
    // const notificationClickSubscription =
    //   Notifications.addNotificationResponseReceivedListener(handleNotificationClick);

    // // Handle user opening the app from a notification (when the app is in the background)
    // messaging().onNotificationOpenedApp((remoteMessage) => {
    //   console.log(
    //     "Notification caused app to open from background state:",
    //     remoteMessage.data.screen,
    //     navigation
    //   );
    //   if (remoteMessage?.data?.screen) {
    //     navigation.navigate(`${remoteMessage.data.screen}`);
    //   }
    // });

    // Check if the app was opened from a notification (when the app was completely quit)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
          if (remoteMessage?.data?.screen) {
            navigation.navigate(`${remoteMessage.data.screen}`);
          }
        }
      });

    // Handle push notifications when the app is in the background
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
      const notification = {
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data, // optional data payload
      };
    });

    // Handle push notifications when the app is in the foreground
    const handlePushNotification = async (remoteMessage) => {
      const {title,body,data } = remoteMessage.notification
      showNotification(title,body,data)
    };
    useEffect(() => {
      const unsubscribe = messaging().onMessage(handlePushNotification)

      return unsubscribe()
    },[])
    // Listen for push notifications when the app is in the foreground
    ;

    // Clean up the event listeners
    return () => {3
      notificationClickSubscription.remove();
    };
}
