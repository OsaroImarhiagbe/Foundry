import {useEffect} from 'react'
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@react-navigation/native';
import { useNotification } from '../NotificationProvider';

export default function PushNotification(){

    const navigation = useNavigation();
    const {showNotification} = useNotification();

    const requestUserPermission = async () => {
      await messaging().registerDeviceForRemoteMessages();
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    };

    useEffect(() => {
      const fetchToken = async () => {
        try{
          if (requestUserPermission()){
            const token = await messaging().getToken()
            return token 
          }
        }catch(error){
          console.error('Error grabbing token:',error.message)
        }
      }
      fetchToken()
      }, []);

      useEffect(() => {
        // Handle user clicking on a notification and open the screen
        const handleNotificationClick = async (response) => {
          const screen = response?.notification?.request?.content?.data?.screen;
          if (screen !== null) {
            navigation.navigate(screen);
          }
        };

        //Listen for user clicking on a notification
        const notificationClickSubscription =
          Notifications.addNotificationResponseReceivedListener(handleNotificationClick);

          return () => {
            notificationClickSubscription.remove();
          };
      },[])
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
    },[])

    useEffect(() => {
       // Handle push notifications when the app is in the background
       const unsubscribe = messaging().setBackgroundMessageHandler(handlePushNotification)
       return () => unsubscribe()
  
    },[])
    // Handle push notifications when the app is in the foreground
    const handlePushNotification = async (remoteMessage) => {
      const {title,body,data } = remoteMessage.notification
      showNotification(title,body,data)
    };
    useEffect(() => {
      const unsubscribe = messaging().onMessage(handlePushNotification)

      return () => unsubscribe()
    },[])
    // Listen for push notifications when the app is in the foreground
    ;

    // Clean up the event listeners
}
