import { createStackNavigator } from '@react-navigation/stack';
import React, { memo,} from 'react';
import {useAuth} from '../authContext.tsx'
import DrawerNavigation from '../navigation/DrawerNavigation.tsx';
import SecondStackNavigation from '../navigation/SecondStackNavigation.tsx';
import OnboardingScreen from '../screen/OnboardingScreen.tsx';
import LoginScreen from '../screen/LoginScreen.tsx';
import RegisterScreen from '../screen/RegisterScreen.tsx'






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
            component={LoginScreen}
            options={{
              headerShown:false,
              gestureEnabled:false,
            }}
          />
          <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerShown:false,
            gestureEnabled:false,
          }}/>
          <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown:false,
            gestureEnabled:false,
          }}/>
       <Stack.Screen
        name='SecondStack'
        component={SecondStackNavigation}
        options={{
          headerShown:false,
          gestureEnabled:false,
      }}/>
        </Stack.Navigator>
      )
    }

export default AuthNavigation