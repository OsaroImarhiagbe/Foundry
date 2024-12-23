import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screen/LoginScreen';
import { lazy,Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import ProjectScreen from '../screen/ProjectScreen';
const RegisterScreen = lazy(() => import('../screen/RegisterScreen'))
const DrawerNavigation = lazy(() => import('./DrawerNavigation'))


const RegisterScreenWrapper = (props) => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <RegisterScreen/>
    </Suspense>
  
    )
}

const DrawerNavigationWrapper = (props) => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <DrawerNavigation/>
    </Suspense>
  
    )
}

const AuthNavigation = () => {


    const Stack = createStackNavigator()

  return (
    <Stack.Navigator
    screenOptions={{
      gestureEnabled:false
    }}
    initialRouteName='Login'>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown:false,
          gestureEnabled:false
          
        }}
      />
      <Stack.Screen
      name="Register"
      component={RegisterScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false
      }}/>
      <Stack.Screen
      name='Drawer'
      component={DrawerNavigationWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false
      }}/>
        <Stack.Screen
      name="ProjectScreen"
      component={ProjectScreen}
      options={{
        headerShown:false,
        presentation:'modal'
      }}/>
    </Stack.Navigator>
  )
}

export default AuthNavigation