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
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { db } from './FireBase/FireBaseConfig';
import { addDoc,doc,collection,Timestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function App() {

  const [isloading,setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(undefined)
  


  useEffect(() => {
    const timer = setTimeout(() => {
     
      setLoading(false)

    },4000)
    return () => clearTimeout(timer)
  },[])

  useEffect(()=>{
    const registerBackgroundtask = async () => {
      try{
        await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
      }catch(err){
        console.error('Error with background:',err)
      }
    }

    registerBackgroundtask()
  },[])


  const BACKGROUND_NOTIFICATION_TASK='BACKGROUND-NOTIFICATION-TASK';

  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    if (error) {
      console.error('Background notification error:', error);
      return;
    }
    if (data) {
      try{
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error('No user ID found in AsyncStorage');
          return;
        }
        const userDocRef = doc(db, 'users', userId);
        const notifCollectionRef = collection(userDocRef, 'notifications');
        await addDoc(notifCollectionRef, {
          title: data.notification.request.content.title || 'No Title',
          body: data.notification.request.content.body || 'No Body',
          createdAt: Timestamp.fromDate(new Date()),
          notification_data: data,
        });
      }catch(err){
        console.error('Error with background notifications',err)
      }
      console.error('Background notification received:', data);
    }
  })

  
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






