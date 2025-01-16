import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
import {useState,useEffect,useRef} from 'react'
import {Alert} from 'react-native'
import NotificationBannerComponent from './NotificationBannerComponent';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
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
  const [showBanner, setShowBanner] = useState(false);
  const [bannerData, setBannerData] = useState({ title: '', message: '' });
  const notificationListener = useRef();
  const responseListener = useRef();
  const {user} = useAuth();

  useEffect(() => {

    const getToken = async () => {
        try{
            const token = await registerForPushNotificationsAsync()
            if (token && user?.uid){
                setExpoPushToken(token ?? '')
                const docRef = firestore().collection('users-notifications-token').doc(user?.uid)
                await docRef.update({
                    id:user.uid,
                    expoToken:token
                })
            }
        }catch(error){
         console.error(`expo token:${error}`)}
    }

    getToken()
   
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      setNotification((prev) => [...prev,notification]);
      const message = notification.request.content.body;
      const title = notification.request.content.title;
      const data = notification.request.content.data
      setBannerData({ title, message });
      setShowBanner(true); 
    //   Alert.alert(
    //     notification.request.content.title,
    //     notification.request.content.body
    //   );
      if(user){
      const docRef = firestore().collection('users').doc(user?.uid);
      const notificationRef = docRef.collection('notifications');
      await notificationRef.add({
        title: title,
        body: message,
        createdAt: firestore.Timestamp.fromDate(new Date()),
        notification_data:data,
      });
    }
    setTimeout(() => setShowBanner(false), 3000);
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

  return(
    <>
    {showBanner && (
        <NotificationBannerComponent
          title={bannerData.title}
          message={bannerData.message}
        />)}
    </>
)
}
