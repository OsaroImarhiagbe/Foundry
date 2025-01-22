import React, { createContext, useContext, useState, useCallback,useEffect } from 'react';
import NotificationBanner from './components/NotificationBanner';
import notifee, { EventType } from '@notifee/react-native'
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import App from '../App';
const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [visible,setVisible] = useState()
  const navigation = useNavigation();

   
    useEffect(() => {
      const fetchToken = async () => {
        try{
          
            await messaging().registerDeviceForRemoteMessages();
            await notifee.requestPermission();
            const token = await messaging().getToken();
            // firestore().collection('users').
        }catch(error){
          console.error('Error grabbing token:',error.message)
        }
      }
      fetchToken()
      }, []);

         // Handle user clicking on a notification and open the screen
         const handleNotificationClick = async (response) => {
            const screen = response?.notification?.request?.content?.data?.screen;
            if (screen !== null) {
              navigation.navigate(screen);
            }
          };
      useEffect(() => {
        //Listen for user clicking on a notification
        const Foreunsubscribe = notifee.onForegroundEvent(async ({type,detail}) => {
            if(type === EventType.PRESS){
                await handleNotificationClick(detail.notification)
            }
        });

        const Backunsubscribe = notifee.onBackgroundEvent(async ({type,detail})=>{
            if(type === EventType.PRESS){
                await handleNotificationClick(detail.notification)
            }
        });

        return () => {
            Foreunsubscribe()
            Backunsubscribe()
          }
      },[handleNotificationClick])
    // Handle user opening the app from a notification (when the app is in the background)
    useEffect(() => {
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log(
          "Notification caused app to open from background state:",
          remoteMessage.data.screen,
          navigation
        );
        if (remoteMessage?.data?.screen) {
          navigation.navigate(`${remoteMessage.data.screen}`);
        }
      });

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
    const unsubscribe = messaging().setBackgroundMessageHandler(handlePushNotification)
       return () => unsubscribe()

    },[handleNotificationClick])
    // Handle push notifications when the app is in the foreground
    const handlePushNotification = useCallback((remoteMessage) => {
      const {title,body,data } = remoteMessage.notification
      showNotification(title,body,data)
    },[showNotification])

    useEffect(() => {
      messaging().onMessage(handlePushNotification)
    },[])
    // Listen for push notifications when the app is in the foreground
    ;

    // Clean up the event listeners

  const showNotification = useCallback(async (title, message,data) => {
    try{
        await notifee.displayNotification({
            title: title,
            body:message,
            ios: {
                foregroundPresentationOptions: {
                    badge: true,
                    sound: true,
                    banner: true,
                    list: true,
                  },
                sound:'default'
            },
        });
        setNotification({ title, message,data });
        setVisible(true)
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setNotification(null);
          setVisible(false)
        }, 5000);
        return () => clearTimeout(timer)
    }catch(error){
        console.error('Error with notification permission:',error.message)
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <NotificationBanner
        visible={visible}
        title={notification.title}
        message={notification.message}
        />
      )}
    </NotificationContext.Provider>
  );
};
