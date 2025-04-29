import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LazyScreenComponent from '../components/BasicComponents/LazyScreenComponent.tsx';

const LoginScreen = React.lazy(() => import('../screen/AuthScreens/LoginScreen.tsx'));
const RegisterScreen = React.lazy(() => import('../screen/AuthScreens/RegisterScreen.tsx'));



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
        </Stack.Navigator>
      )
    }

export default AuthNavigation