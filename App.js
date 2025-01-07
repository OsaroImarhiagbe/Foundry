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
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
// import { OneSignal } from 'react-native-onesignal';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from "expo-constants";

export default function App() {

  const [isloading,setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(undefined)

  
  useEffect(() => {
    OneSignal.initialize('8a6e60de-6336-40e2-8162-4b8077a2176d');

    // Also need enable notifications to complete OneSignal setup
    OneSignal.Notifications.requestPermission(true);

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






