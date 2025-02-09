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
import { NotificationProvider } from './app/NotificationProvider';
import 'react-native-reanimated'
import 'react-native-gesture-handler'


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
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: 'rgb(5, 126, 230)',
      onPrimary: 'rgb(255, 255, 255)',
      primaryContainer: 'rgb(220, 225, 255)',
      onPrimaryContainer: 'rgb(0, 22, 78)',
      secondary: 'rgb(141, 65, 137)',
      onSecondary: 'rgb(255, 255, 255)',
      secondaryContainer: 'rgb(255, 215, 246)',
      onSecondaryContainer: 'rgb(56, 0, 57)',
      tertiary: 'rgb(117, 84, 112)',
      onTertiary: 'rgb(255, 255, 255)',
      tertiaryContainer: 'rgb(255, 215, 246)',
      onTertiaryContainer: 'rgb(44, 18, 42)',
      error: 'rgb(186, 26, 26)',
      onError: 'rgb(255, 255, 255)',
      errorContainer: 'rgb(255, 218, 214)',
      onErrorContainer: 'rgb(65, 0, 2)',
      background: 'rgb(255, 255, 255)',
      onBackground: 'rgb(255, 255, 255)',
      surface: 'rgb(254, 251, 255)',
      onSurface: 'rgb(27, 27, 31)',
      surfaceVariant: 'rgb(226, 225, 236)',
      onSurfaceVariant: 'rgb(69, 70, 79)',
      outline: 'rgb(118, 118, 128)',
      outlineVariant: 'rgb(198, 198, 208)',
      shadow: 'rgb(0, 0, 0)',
      scrim: 'rgb(0, 0, 0)',
      inverseSurface: 'rgb(48, 48, 52)',
      inverseOnSurface: 'rgb(242, 240, 244)',
      inversePrimary: 'rgb(182, 196, 255)',
      elevation: {
        level0: 'transparent',
        level1: 'rgb(245, 243, 251)',
        level2: 'rgb(239, 238, 248)',
        level3: 'rgb(233, 233, 246)',
        level4: 'rgb(231, 232, 245)',
        level5: 'rgb(227, 228, 243)'
      },
      surfaceDisabled: 'rgba(27, 27, 31, 0.12)',
      onSurfaceDisabled: 'rgba(27, 27, 31, 0.38)',
      backdrop: 'rgba(47, 48, 56, 0.4)',
      backgroundContainer: 'rgb(190, 233, 255)',
      onBackgroundContaine: 'rgb(0, 31, 42)',
      text: 'rgb(0, 0, 0)',
      onText: 'rgb(255, 255, 255)',
      textContainer: 'rgb(203, 230, 255)',
      onTextContainer: 'rgb(0, 30, 48)'
        },
  }


  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: 'rgb(182, 196, 255)',
      onPrimary: 'rgb(247, 247, 247)',
      primaryContainer: 'rgb(38, 65, 145)',
      onPrimaryContainer: 'rgb(220, 225, 255)',
      secondary: 'rgb(84, 95, 113)',
      onSecondary: 'rgb(69, 90, 100)',
      secondaryContainer: 'rgb(114, 40, 111)',
      onSecondaryContainer: 'rgb(255, 215, 246)',
      tertiary: 'rgb(247, 247, 247)',
      onTertiary: 'rgb(128, 128, 128)',
      tertiaryContainer: 'rgb(91, 61, 87)',
      onTertiaryContainer: 'rgb(255, 215, 246)',
      error: 'rgb(255, 180, 171)',
      onError: 'rgb(105, 0, 5)',
      errorContainer: 'rgb(147, 0, 10)',
      onErrorContainer: 'rgb(255, 180, 171)',
      background: 'rgb(18, 18, 18)',
      onBackground: 'rgb(0, 53, 70)',
      surface: 'rgb(27, 27, 31)',
      onSurface: 'rgb(228, 225, 230)',
      surfaceVariant: 'rgb(69, 70, 79)',
      onSurfaceVariant: 'rgb(198, 198, 208)',
      outline: 'rgb(143, 144, 154)',
      outlineVariant: 'rgb(69, 70, 79)',
      shadow: 'rgb(0, 0, 0)',
      scrim: 'rgb(0, 0, 0)',
      inverseSurface: 'rgb(228, 225, 230)',
      inverseOnSurface: 'rgb(48, 48, 52)',
      inversePrimary: 'rgb(64, 89, 170)',
      elevation: {
        level0: 'transparent',
        level1: 'rgb(35, 35, 42)',
        level2: 'rgb(39, 41, 49)',
        level3: 'rgb(44, 46, 56)',
        level4: 'rgb(46, 47, 58)',
        level5: 'rgb(49, 51, 62)'
      },
      surfaceDisabled: 'rgba(228, 225, 230, 0.12)',
      onSurfaceDisabled: 'rgba(228, 225, 230, 0.38)',
      backdrop: 'rgba(47, 48, 56, 0.4)',
      backgroundContainer: 'rgb(0, 77, 100)',
      onBackgroundContainer: 'rgb(190, 233, 255)',
      text: 'rgb(247, 247, 247)',
      onText: 'rgb(0, 52, 79)',
      textContainer: 'rgb(0, 75, 113)',
      onTextContainer: 'rgb(203, 230, 255)'
        }
      }

  const colorScheme = useColorScheme()
  
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  console.log('App:',colorScheme)
  



  
  return (
    

    <I18nextProvider i18n={i18n}>
       <Provider store={store}>
      <PersistGate loading={isloading} persistor={persistor}>
        <MenuProvider>
          <AuthContextProvider>
        <PaperProvider theme={theme}>
        <NavigationContainer>
        <NotificationProvider>
          {isloading ? <SplashScreen/> :   <AuthNavigation/> }
          </NotificationProvider>
        </NavigationContainer>
        </PaperProvider>
      </AuthContextProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light':'dark'} />
      </MenuProvider>
      </PersistGate>
    </Provider>
    </I18nextProvider>
  
  )
}






