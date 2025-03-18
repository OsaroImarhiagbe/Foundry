import React, { createContext, useContext, useState, useCallback,useEffect,ReactNode, useRef } from 'react';
import notifee, { EventType } from '@notifee/react-native'
import { useNavigation } from '@react-navigation/native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { useAuth } from './authContext';
import {crashlytics, messaging,NotificationsRef,UsersRef } from '../FirebaseConfig';
import { doc, setDoc} from '@react-native-firebase/firestore';
import {log,recordError} from '@react-native-firebase/crashlytics'

const NotificationContext = createContext<any>(null);


export const useNotification = () => {
  const context = useContext(NotificationContext);
  if(!context){
    throw new Error('must use Notification context')
  }
  return context
};

interface NotificationProp {
  children: ReactNode
}

interface NotificationData {
  title:string,
  message:string,
  data: { [key: string]: any };
}
export const NotificationProvider = ({ children }:NotificationProp) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const {user} = useAuth()
  const [visible,setVisible] = useState<boolean>(false)
  const navigation = useNavigation();

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const showNotification = useCallback(async (title:string, message:string,data:any) => {
    log(crashlytics,'Notifcation Provider: Show Notification')
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
        if(user.userId){
          await setDoc(doc(NotificationsRef,user.userId),{
            title:title,
            message:message
          })
        }
        setNotification({ title, message,data });
        setVisible(true)
        const timer = setTimeout(() => {
          setNotification(null);
          setVisible(false);
        },5000);
        return () => clearTimeout(timer)
    }catch(error:unknown | any){
        recordError(crashlytics,error)
        console.error('Error with notification permission:',error.message)
    }
  }, []);
   
    useEffect(() => {
      log(crashlytics,'Notifcation Provider: Getting token')
      if (!user?.userId) return;
      const fetchToken = async () => {
        try{
          await notifee.requestPermission();
          const token = await messaging.getToken();
          if (!token) throw new Error('Failed to get FCM token');      
          await setDoc(doc(UsersRef,user.userId),{
            token:token
          },{merge:true})
        }catch(error: unknown | any){
          recordError(crashlytics,error)
          console.error('Error grabbing token:',error)
        }
      }
      fetchToken()
      }, []);


    const handleNotificationClick = useCallback((notification:unknown | any) => {
        const screen = notification?.data?.screen;
        if (screen && typeof screen == 'string') {
          navigation.navigate(`${screen}` as never);
        }
    },[navigation]);

    const handlePushNotification = useCallback(async (remoteMessage:FirebaseMessagingTypes.RemoteMessage): Promise<void> => {
      const notification = remoteMessage.notification
      const data = remoteMessage?.data
      if(notification?.title && notification?.body){
        await showNotification(notification?.title,notification?.body,data)
      }
    },[showNotification])


    useEffect(() => {
      const unsub = messaging.onMessage(handlePushNotification)
      return unsub
    },[handlePushNotification])
    
    useEffect(() => {
      const Foreunsubscribe = notifee.onForegroundEvent(({type,detail}) => {
            if(type === EventType.PRESS){
              handleNotificationClick(detail.notification)
            }
        });

        notifee.onBackgroundEvent(async ({type,detail})=>{
            if(type === EventType.PRESS){
              handleNotificationClick(detail.notification)
            }
        });

        return () => Foreunsubscribe()
      },[handleNotificationClick])

    useEffect(() => {
      const backgroundOpenApp = messaging.onNotificationOpenedApp((remoteMessage:FirebaseMessagingTypes.RemoteMessage) => {
        console.log(
          "Notification caused app to open from background state:",
          remoteMessage?.data?.screen,
          navigation
        );
        if (remoteMessage?.data?.screen) {
          navigation.navigate(`${remoteMessage?.data?.screen}` as never );
        }
      });
      messaging.getInitialNotification().then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
          "Notification caused app to open from quit state:",
          remoteMessage.notification
          );
          if (remoteMessage?.data?.screen) {
          navigation.navigate(`${remoteMessage?.data?.screen}` as never );
          }
      }
    });
    messaging.setBackgroundMessageHandler(handlePushNotification)
    return () => backgroundOpenApp()

    },[navigation,handleNotificationClick])


  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
