import { createStackNavigator } from '@react-navigation/stack';
import { lazy,Suspense, useEffect,useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {useAuth} from '../authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
const RegisterScreen = lazy(() => import('../screen/RegisterScreen'))
const DrawerNavigation = lazy(() => import('./DrawerNavigation'))
const OnboardingScreen = lazy(()=> import('../screen/OnboardingScreen'))
const LoginScreen = lazy(()=> import('../screen/LoginScreen'));


type NavigationProp = {
  navigate(arg0: string, arg1: { screen: string; }): unknown;
  Drawer:undefined,
  Home:undefined
}

const RegisterScreenWrapper = () => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <RegisterScreen/>
    </Suspense>
  
    )
}

const LoginScreenWrapper = () => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <LoginScreen/>
  </Suspense>

  )
}

const DrawerNavigationWrapper = () => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <DrawerNavigation/>
    </Suspense>
  
    )
}



const OnboardingScreenWrapper = () =>{
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <OnboardingScreen/>
  </Suspense>
  )
}
const AuthNavigation = () => {
  const navigation = useNavigation<NavigationProp>()
  const [loading,setLoading] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined)
  const [showOnboarding,setShowOnboarding] = useState<boolean>(false)

  const {updateUserData} = useAuth()

    useEffect(() =>{
      setLoading(true)
      const getAuthState = async () => {
          const currentUser = await AsyncStorage.getItem('authUser')
          if(currentUser !== null){
              setIsAuthenticated(true)
              navigation.navigate('Drawer',{screen:'Home'})
              setLoading(false)
          }else{
              setIsAuthenticated(false);
              setLoading(false)
          }
      }
      getAuthState()
  },[])

  useEffect(()=>{
    checkifOnboard()
  },[])

  const  checkifOnboard = async () => {
      const onboardkey = await AsyncStorage.getItem('onboarded')
      if(onboardkey=='1'){
        setShowOnboarding(false)
      }else{
        setShowOnboarding(true)
      }
    }
  



    const Stack = createStackNavigator()


    if(showOnboarding==null){
      return null
    }
    if(isAuthenticated && showOnboarding){
      return (
          <Stack.Navigator
          initialRouteName='Drawer'
          >
             <Stack.Screen
            name='Drawer'
            component={DrawerNavigationWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false,
              animation:'fade_from_bottom'
            }}/>
          </Stack.Navigator>
        )
    }else{
      return (
        <Stack.Navigator initialRouteName='Login'>    
          <Stack.Screen
            name="Login"
            component={LoginScreenWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false,
              animation:'fade_from_bottom'
              
            }}
          /> 
          <Stack.Screen
          name="Register"
          component={RegisterScreenWrapper}
          options={{
            headerShown:false,
            gestureEnabled:false,
            animation:'fade_from_bottom'
          }}/>
          <Stack.Screen
          name="Onboarding"
          component={OnboardingScreenWrapper}
          options={{
            headerShown:false,
          }}/>
          <Stack.Screen
          name='Drawer'
          component={DrawerNavigationWrapper}
          options={{
            headerShown:false,
            gestureEnabled:false,
            animation:'fade_from_bottom'
          }}/>
        </Stack.Navigator>
      )
    }

  }

export default AuthNavigation