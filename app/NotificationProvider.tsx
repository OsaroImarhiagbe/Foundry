import React, { createContext, useContext, useState, useCallback,useEffect,ReactNode } from 'react';
import NotificationBanner from './components/NotificationBanner';
import notifee, { EventType } from '@notifee/react-native'
import { useNavigation } from '@react-navigation/native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from './authContext';
const NotificationContext = createContext<any>(null);

export const useNotification = () => useContext(NotificationContext);

interface NotificationProp {
  children: ReactNode
}

interface NotificationData {
  title:string,
  message:string,
  data:string
}

export const NotificationProvider = ({ children }:NotificationProp) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const {user} = useAuth()
  const [visible,setVisible] = useState<boolean>(false)
  const navigation = useNavigation();


  const showNotification = useCallback(async (title:string, message:string,data:string) => {
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
    }catch(error:any){
        console.error('Error with notification permission:',error.message)
    }
  }, []);
   
    useEffect(() => {
      const fetchToken = async () => {
        try{
          
            await messaging().registerDeviceForRemoteMessages();
            await notifee.requestPermission();
            const token = await messaging().getToken();
            await firestore().collection('users').doc(user.userId).update({
                token:token 
            })
        }catch(error:any){
          console.error('Error grabbing token:',error.message)
        }
      }
      fetchToken()
      }, []);


    const handleNotificationClick = async (response:any) => {
        const screen = response?.notification?.request?.content?.data?.screen;
        if (screen) {
          navigation.navigate(`${screen}`);
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
      messaging().onNotificationOpenedApp((remoteMessage:FirebaseMessagingTypes.RemoteMessage) => {
        console.log(
          "Notification caused app to open from background state:",
          remoteMessage?.data?.screen,
          navigation
        );
        if (remoteMessage?.data?.screen) {
          navigation.navigate(`${remoteMessage?.data?.screen}`);
        }
      });

    
        messaging().getInitialNotification().then((remoteMessage) => {
            if (remoteMessage) {
                console.log(
                "Notification caused app to open from quit state:",
                remoteMessage.notification
                );
                if (remoteMessage?.data?.screen) {
                navigation.navigate(`${remoteMessage?.data?.screen}`);
                }
      }
    });
    const unsubscribe = messaging().setBackgroundMessageHandler(handlePushNotification)
       return unsubscribe

    },[handleNotificationClick])
    
    const handlePushNotification = useCallback((remoteMessage:FirebaseMessagingTypes.RemoteMessage) => {
      const {title,body,data } = remoteMessage.notification
      showNotification(title,body,data)
    },[showNotification])

    useEffect(() => {
      messaging().onMessage(handlePushNotification)
    },[])

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
