import React, { createContext, useContext, useState, useCallback,useEffect } from 'react';
import NotificationBanner from './components/NotificationBanner';
import notifee, { EventType } from '@notifee/react-native'
import { useNavigation } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './authContext';
const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const {user} = useAuth()
  const [visible,setVisible] = useState()
  const navigation = useNavigation();

   
    useEffect(() => {
      const fetchToken = async () => {
        try{
          
            await messaging().registerDeviceForRemoteMessages();
            await notifee.requestPermission();
            const token = await messaging().getToken();
            await firestore().collection('users').doc(user.userId).update({
                token:token 
            })
        }catch(error){
          console.error('Error grabbing token:',error.message)
        }
      }
      fetchToken()
      }, []);


         const handleNotificationClick = async (response) => {
            const screen = response?.notification?.request?.content?.data?.screen;
            if (screen !== null) {
              navigation.navigate(screen);
            }
          };
      useEffect(() => {
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

    
        messaging().getInitialNotification().then((remoteMessage) => {
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
    const unsubscribe = messaging().setBackgroundMessageHandler(handlePushNotification)
       return () => unsubscribe()

    },[handleNotificationClick])
    
    const handlePushNotification = useCallback((remoteMessage) => {
      const {title,body,data } = remoteMessage.notification
      showNotification(title,body,data)
    },[showNotification])

    useEffect(() => {
      messaging().onMessage(handlePushNotification)
    },[])




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
