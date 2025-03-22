import { createStackNavigator } from '@react-navigation/stack';
import React, {Suspense} from 'react';
import {useAuth} from '../authContext.tsx'
import DrawerNavigation from '../navigation/DrawerNavigation.tsx';
import FallBackComponent from '../components/FallBackComponent.tsx';
const SecondStackNavigation = React.lazy(() => import('../navigation/SecondStackNavigation.tsx'));
const OnboardingScreen = React.lazy(() => import('../screen/OnboardingScreen.tsx'));
const LoginScreen = React.lazy(() => import('../screen/LoginScreen.tsx'));
const RegisterScreen = React.lazy(() => import('../screen/RegisterScreen.tsx'));


const SecondStackNavigationWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <SecondStackNavigation/>
    </Suspense>
  )
})
const OnboardingScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <OnboardingScreen/>
    </Suspense>
  )
})
const LoginScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <LoginScreen/>
    </Suspense>
  )
})
const RegisterScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <RegisterScreen/>
    </Suspense>
  )
})








const AuthNavigation = () => {
  const {isAuthenticated} = useAuth()
  const Stack = createStackNavigator()
 



  return (
        <Stack.Navigator initialRouteName={isAuthenticated ? 'Drawer':'Login'}>
        <Stack.Screen
            name='Drawer'
            component={DrawerNavigation}
            options={{
              headerShown:false,
              gestureEnabled:false,
            }}/>
            <Stack.Screen
            name="Login"
            component={LoginScreenWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false,
            }}
          />
          <Stack.Screen
          name="Register"
          component={RegisterScreenWrapper}
          options={{
            headerShown:false,
            gestureEnabled:false,
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