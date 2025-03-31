import { NavigationContainer} from '@react-navigation/native';
import { MenuProvider } from 'react-native-popup-menu';
import { AuthContextProvider } from './app/authContext';
import { StatusBar } from 'expo-status-bar';
import React, {lazy, Suspense, useEffect, useState,} from 'react'
import {store,persistor} from './app/store'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './app/Language/i18n';
import { darkTheme,lightTheme } from 'config/color.ts';
import { useColorScheme,} from 'react-native';
import { NotificationProvider } from './app/NotificationProvider';
import 'react-native-reanimated'
import { PaperProvider,} from 'react-native-paper';
import 'react-native-gesture-handler'
import AuthNavigation from './app/navigation/AuthNavigation.tsx'
import DrawerNavigation from './app/navigation/DrawerNavigation.tsx';
import { DefaultTheme as Defaulttheme, DarkTheme as Darktheme } from '@react-navigation/native';
import notifee from '@notifee/react-native'
import { recordError } from '@react-native-firebase/crashlytics';
import { crashlytics } from 'FirebaseConfig.ts';
import Toast from 'react-native-toast-message'
import { useAuth } from '././app/authContext.tsx';



function AppContent() {
  const {isAuthenticated} = useAuth();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  return (
<PaperProvider theme={theme}>
        <NavigationContainer theme={colorScheme === 'dark' ? Darktheme : Defaulttheme}>
        <NotificationProvider>
          {isAuthenticated ? <DrawerNavigation/> : <AuthNavigation/>}
          </NotificationProvider>
        </NavigationContainer>
         <Toast/>
  </PaperProvider>
  )
}

export default function App() {
  const colorScheme = useColorScheme();



  useEffect(() => {
    notifee.setBadgeCount(0).catch((error:unknown | any) => recordError(crashlytics,error))
  },[])
 
  return (
    

    <I18nextProvider i18n={i18n}>
       <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MenuProvider>
      <AuthContextProvider>
        <AppContent/>
      </AuthContextProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light':'dark'} />
      </MenuProvider>
      </PersistGate>
    </Provider>
    </I18nextProvider>
  
  )
}






