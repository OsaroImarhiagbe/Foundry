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
import { PaperProvider, MD3LightTheme as DefaultTheme,MD3DarkTheme as DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
//import { NotificationProvider } from './app/NotificationProvider';



export default function App() {
  const [isloading,setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(undefined)
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    },4000)
    return () => clearTimeout(timer)
  },[])


  const lightTheme = {
    ...DefaultTheme, // React Native Paper's default theme
    colors: {
      ...DefaultTheme.colors,
      primary: '#6200EE', // Primary brand color (e.g., a vibrant purple)
      accent: '#03DAC6', // Secondary/accent color (e.g., teal)
      background: '#FFFFFF', // App background color
      surface: '#FFFFFF', // Cards, menus, and similar surfaces
      text: '#000000', // Text color
      placeholder: '#6C757D', // Placeholder text in inputs
      error: '#B00020', // Error message color
      disabled: '#E0E0E0', // Disabled button/input background
      notification: '#FF80AB', // Notification badge color
    },
  };

  const darkTheme = {
    ...DarkTheme, // React Native Paper's dark theme
    colors: {
      ...DarkTheme.colors,
      primary: '#BB86FC', // Primary brand color (slightly muted for dark mode)
      accent: '#03DAC6', // Secondary/accent color (consistent with light mode)
      background: '#121212', // App background color
      surface: '#1E1E1E', // Cards, menus, and similar surfaces
      text: '#FFFFFF', // Text color
      placeholder: '#BDBDBD', // Placeholder text in inputs
      error: '#CF6679', // Error message color (softer red for dark mode)
      disabled: '#373737', // Disabled button/input background
      notification: '#FF80AB', // Notification badge color (consistent)
    },
  };

  const colorScheme = useColorScheme()
  
  const theme = colorScheme === 'light' ? darkTheme : lightTheme;
  console.log(colorScheme)
  



  
  return (
    

    <I18nextProvider i18n={i18n}>
       <Provider store={store}>
      <PersistGate loading={isloading} persistor={persistor}>
        <MenuProvider>
          <AuthContextProvider>
          {/* <NotificationProvider> */}
        <PaperProvider theme={theme}>
        <NavigationContainer>
          {isloading ? <SplashScreen/> :   <AuthNavigation/> }
        </NavigationContainer>
        </PaperProvider>
        {/* </NotificationProvider> */}
      </AuthContextProvider>
      <StatusBar style="light" />
      </MenuProvider>
      </PersistGate>
    </Provider>
    </I18nextProvider>
  
  );
}






