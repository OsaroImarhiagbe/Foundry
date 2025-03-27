import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LazyScreenComponent from '../components/LazyScreenComponent.tsx';

const OnboardingScreen = React.lazy(() => import('../screen/OnboardingScreen.tsx'));
const LoginScreen = React.lazy(() => import('../screen/LoginScreen.tsx'));
const RegisterScreen = React.lazy(() => import('../screen/RegisterScreen.tsx'));



const OnboardingScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <OnboardingScreen/>
      </LazyScreenComponent>
  )
})
const LoginScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <LoginScreen/>
      </LazyScreenComponent>
  )
})
const RegisterScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <RegisterScreen/>
      </LazyScreenComponent>
  )
})








const AuthNavigation = () => {
  const Stack = createStackNavigator()
 



  return (
        <Stack.Navigator initialRouteName='Login'>
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
        </Stack.Navigator>
      )
    }

export default AuthNavigation