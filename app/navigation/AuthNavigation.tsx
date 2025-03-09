import { createStackNavigator } from '@react-navigation/stack';
import {useState,lazy} from 'react';
import {useAuth} from '../authContext';
import LazyScreenComponent from 'app/components/LazyScreenComponent';

const RegisterScreen = lazy(() => import('../screen/RegisterScreen'))
const DrawerNavigation = lazy(() => import('./DrawerNavigation'))
const OnboardingScreen = lazy(()=> import('../screen/OnboardingScreen'))
const LoginScreen = lazy(()=> import('../screen/LoginScreen'));
const SecondStackNavigation = lazy(() => import('../navigation/SecondStackNavigation'))


const DrawerNavigationWrapper = () => {
  return (
    <LazyScreenComponent>
      <DrawerNavigation/>
    </LazyScreenComponent>
  )
}

const SecondStackNavigationWrapper = () => {
  return (
    <LazyScreenComponent>
      <SecondStackNavigation/>
    </LazyScreenComponent>
  )
  }
const OnboardingScreenWrapper = () =>{
  return (
    <LazyScreenComponent>
      <OnboardingScreen/>
    </LazyScreenComponent>
)
}

const RegisterScreenWrapper = () => {

  return (
    <LazyScreenComponent>
      <RegisterScreen/>
    </LazyScreenComponent>
  )
}

const LoginScreenWrapper = () => {

return (
  <LazyScreenComponent>
    <LoginScreen/>
  </LazyScreenComponent>
)
}






const AuthNavigation = () => {
  const [showOnboarding,setShowOnboarding] = useState<boolean>(false)
  const [loading,setLoading] = useState<boolean>(false)
  const {isAuthenticated} = useAuth()
  const Stack = createStackNavigator()
  return (
        <Stack.Navigator initialRouteName={isAuthenticated ? 'Drawer':'Login'}>
          {
          isAuthenticated  ? (
            <Stack.Screen
            name='Drawer'
            component={DrawerNavigationWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false,
              animation:'fade_from_bottom'
            }}/> ) : (<Stack.Screen
            name="Login"
            component={LoginScreenWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false,
              animation:'fade_from_bottom'
              
            }}
          /> )
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
            gestureEnabled:false,
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