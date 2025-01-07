import { NavigationContainer} from '@react-navigation/native';
import { MenuProvider } from 'react-native-popup-menu';
import { AuthContextProvider } from './app/authContext';
import { StatusBar } from 'expo-status-bar';
import {useEffect,useState} from 'react'
import SplashScreen from './app/screen/SplashScreen';
import {store,persistor} from './app/store'
import { Provider } from 'react-redux';
import AuthNavigation from './app/navigation/AuthNavigation';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './app/Language/i18n';
// import { OneSignal } from 'react-native-onesignal';

export default function App() {

  const [isloading,setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(undefined)

 


  // useEffect(() => {
  //   // Set your OneSignal App ID here
  //   OneSignal.initialize('8a6e60de-6336-40e2-8162-4b8077a2176d');  // Replace with your OneSignal App ID

  //   // iOS-specific setup (prompt for notifications)
  //   OneSignal.promptForPushNotificationsWithUserResponse(response => {
  //     console.log('Prompt response:', response);
  //   });

  //   // Notification opened handler
  //   OneSignal.setNotificationOpenedHandler(notification => {
  //     console.log('Notification opened:', notification);
  //     // You can navigate to a specific screen based on the notification
  //   });

  //   // Notification received handler
  //   OneSignal.setNotificationReceivedHandler(notification => {
  //     console.log('Notification received:', notification);
  //     // You can process the notification data here
  //   });

  //   // Add subscription observer to get the OneSignal Player ID
  //   OneSignal.addSubscriptionObserver(({ to }) => {
  //     if (to && to.userId) {
  //       console.log('Player ID:', to.userId);  // Get the Player ID for this device
  //     }
  //   });
  // }, []);
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






