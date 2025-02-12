import { createStackNavigator } from '@react-navigation/stack';
import { lazy,Suspense, useEffect,useState } from 'react';
import { ActivityIndicator } from 'react-native';
import {useAuth} from '../authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
const RegisterScreen = lazy(() => import('../screen/RegisterScreen'))
const DrawerNavigation = lazy(() => import('./DrawerNavigation'))
const OnboardingScreen = lazy(()=> import('../screen/OnboardingScreen'))
const LoginScreen = lazy(()=> import('../screen/LoginScreen'));
const SecondStackNavigation = lazy(() => import('../navigation/SecondStackNavigation'))


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


const SecondStackNavigationWrapper = () => {
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <SecondStackNavigation/>
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
  const [showOnboarding,setShowOnboarding] = useState<boolean>(false)
  const {isAuthenticated} = useAuth()

  useEffect(()=>{
    const  checkifOnboard = async () => {
      const onboardkey = await AsyncStorage.getItem('onboarded')
      if(onboardkey=='1'){
        setShowOnboarding(false)
      }else{
        setShowOnboarding(true)
      }
    }
    checkifOnboard()
  },[])
    const Stack = createStackNavigator()
      return (
        <Stack.Navigator initialRouteName={isAuthenticated && showOnboarding ? 'Drawer':'Login'}>
          {
            isAuthenticated && showOnboarding ? 
            <Stack.Screen
            name='Drawer'
            component={DrawerNavigationWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false,
              animation:'fade_from_bottom'
            }}/> :  <Stack.Screen
            name="Login"
            component={LoginScreenWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false,
              animation:'fade_from_bottom'
              
            }}
          /> 
          }
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
        name='SecondStack'
        component={SecondStackNavigationWrapper}
        options={{
          headerShown:false,
          gestureEnabled:false,
      }}/>
        </Stack.Navigator>
      )
    }

export default AuthNavigation