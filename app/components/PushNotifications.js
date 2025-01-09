import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { db } from '../../FireBase/FireBaseConfig';
import { addDoc,updateDoc,Timestamp,doc } from 'firebase/firestore';
import { useAuth } from '../authContext';
import {useState,useEffect,useRef} from 'react'


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function PushNotification(){
    const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState([]);
  const notificationListener = useRef();
  const responseListener = useRef();
  const {user} = useAuth();

  useEffect(() => {

    const getToken = async () => {
        try{
            const token = await registerForPushNotificationsAsync()
            if (token && user?.userId){
                setExpoPushToken(token ?? '')
                const docRef = doc(db,'users',user?.userId)
                await updateDoc(docRef,{
                  expoToken:token
                })
                console.log('expo token in firestore:',expoPushToken)
            }
        }catch(error){
         console.error(`expo token:${error}`)}
    }

    getToken()
   
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      setNotification((prev) => [...prev,notification]);
      if(user){
      const message = notification.request.content.body;
      const title = notification.request.content.title;
      const data = notification.request.content.data
      const docRef = doc(db, 'users', user?.userId);
      const notificationRef = collection(docRef, 'notifications');
      await addDoc(notificationRef, {
        title: title,
        body: message,
        createdAt: Timestamp.fromDate(new Date()),
        notification_data:data,
      });
    }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}