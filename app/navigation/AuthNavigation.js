import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screen/LoginScreen';
import { lazy,Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import ProjectScreen from '../screen/ProjectScreen';
import LocationScreen from '../screen/LocationScreen';

const RegisterScreen = lazy(() => import('../screen/RegisterScreen'))
const DrawerNavigation = lazy(() => import('./DrawerNavigation'))
const ReportBugScreen = lazy(() => import('../screen/ReportBugScreen'))
const ContactUsScreen = lazy(() => import('../screen/ContactUsScreen'))
const ProjectEntryScreen = lazy(() => import('../screen/ProjectEntryScreen'))
const SkillsScreen = lazy(() => import('../screen/SkillsScreen'))
const RegisterScreenWrapper = (props) => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <RegisterScreen/>
    </Suspense>
  
    )
}

const DrawerNavigationWrapper = (props) => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <DrawerNavigation/>
    </Suspense>
  
    )
}
const ReportBugScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <ReportBugScreen/>
  </Suspense>

  )
}
const ContactUsScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <ContactUsScreen/>
  </Suspense>

  )
}
const SkillsScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <SkillsScreen/>
  </Suspense>

  )
}

const ProjectEntryScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <ProjectEntryScreen/>
  </Suspense>

  )
}
const AuthNavigation = () => {


    const Stack = createStackNavigator()

  return (
    <Stack.Navigator
    screenOptions={{
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
        presentation:'modal',
      }}/>
          <Stack.Screen
      name="LocationScreen"
      component={LocationScreen}
      options={{
        headerShown:false,
        presentation:'modal',
      }}/>
      <Stack.Screen
      name="ReportBugScreen"
      component={ReportBugScreenWrapper}
      options={{
        headerShown:false,
        presentation:'modal',
      }}/>
        <Stack.Screen
      name="ContactUsScreen"
      component={ContactUsScreenWrapper}
      options={{
        headerShown:false,
        presentation:'modal',
      }}/>
      <Stack.Screen
      name="ProjectEntryScreen"
      component={ProjectEntryScreenWrapper}
      options={{
        headerShown:false,
        presentation:'modal',
      }}/>
       <Stack.Screen
      name="SkillsScreen"
      component={SkillsScreenWrapper}
      options={{
        headerShown:false,
        presentation:'modal',
      }}/>
    </Stack.Navigator>
  )
}

export default AuthNavigation