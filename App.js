import { NavigationContainer} from '@react-navigation/native';
import { MenuProvider } from 'react-native-popup-menu';
import { AuthContextProvider } from './app/authContext';
import { StatusBar } from 'expo-status-bar';
import {useEffect,useState,useRef} from 'react'
import SplashScreen from './app/screen/SplashScreen';
import {store,persistor} from './app/store'
import { Provider } from 'react-redux';
import AuthNavigation from './app/navigation/AuthNavigation';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './app/Language/i18n';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { db} from './FireBase/FireBaseConfig';
import { updateDoc } from 'firebase/firestore';
import { useAuth } from './app/authContext';


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


export default function App() {

  const [isloading,setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(undefined)
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
                console.error('expo token in firestore:',expoPushToken)
            }
        }catch(error){
         console.error(`${error}`)}
    }

    getToken()
   
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
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


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)

    },4000)
    return () => clearTimeout(timer)
  },[])

  
  return (

    <I18nextProvider i18n={i18n}>
       <Provider store={store}>
      <PersistGate loading={isloading} persistor={persistor}>
      <MenuProvider>
          <AuthContextProvider>
        <NavigationContainer>
          {isloading ? <SplashScreen/> :   <AuthNavigation/> }
      </NavigationContainer>
    </AuthContextProvider>
    <StatusBar style="light" />
    </MenuProvider>
      </PersistGate>
    </Provider>
    </I18nextProvider>
  
  );
}






