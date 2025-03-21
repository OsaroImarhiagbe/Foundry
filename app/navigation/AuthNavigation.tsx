import { createStackNavigator } from '@react-navigation/stack';
import React, { memo, Suspense,} from 'react';
import {useAuth} from '../authContext.tsx'
import DrawerNavigation from '../navigation/DrawerNavigation.tsx'
const SecondStackNavigation = React.lazy(() => import('../navigation/SecondStackNavigation.tsx'));
const OnboardingScreen = React.lazy(() => import('../screen/OnboardingScreen.tsx'));
const LoginScreen = React.lazy(() => import('../screen/LoginScreen.tsx'));
const RegisterScreen = React.lazy(() => import('../screen/RegisterScreen.tsx'));


const SecondStackNavigationWrapper = () => {
  return (
    <Suspense>
      <SecondStackNavigation/>
    </Suspense>
  )
}
const OnboardingScreenWrapper = () => {
  return (
    <Suspense>
      <OnboardingScreen/>
    </Suspense>
  )
}
const LoginScreenWrapper = () => {
  return (
    <Suspense>
      <LoginScreen/>
    </Suspense>
  )
}
const RegisterScreenWrapper = () => {
  return (
    <Suspense>
      <RegisterScreen/>
    </Suspense>
  )
}






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