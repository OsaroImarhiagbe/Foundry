import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { lazy,Suspense,memo } from 'react';
import { ActivityIndicator, useColorScheme } from 'react-native';
import  DashBoardScreen  from '../screen/DashBoardScreen';
import { useTheme } from 'react-native-paper';
import LazyScreenComponent from 'app/components/LazyScreenComponent';
const HomeScreen = lazy(() => import('../screen/HomeScreen'))
const MessageScreen = lazy(() => import('../screen/MessageScreen'))
const EditScreen = lazy(() => import('../screen/EditScreen'))
const OtherUserScreen = lazy(() => import('../screen/OtherUserScreen'))


const MessageScreenWrapper = memo(() => {
  return (
      <LazyScreenComponent>
      <MessageScreen/>
      </LazyScreenComponent>
)})

const HomeScreenWrapper = memo(() => {
  return(
  <LazyScreenComponent>
    <HomeScreen/>
  </LazyScreenComponent>
  )
})

const EditScreenWrapper = memo(() => {
  return (
  <LazyScreenComponent>
    <EditScreen/>
  </LazyScreenComponent>
)})

const OtherUserScreenWrapper = memo(() => {
  return (
  <LazyScreenComponent>
    <OtherUserScreen/>
  </LazyScreenComponent>
)})

const StackNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
    initialRouteName='Dash'>
        <Stack.Screen
        name='Dash'
        component={DashBoardScreen}
        options={{
        headerShown: false, 
        gestureEnabled:false,
       }}
      />
      <Stack.Screen
        name='Main'
        component={HomeScreenWrapper}
        options={{
        headerShown: false, 
        gestureEnabled:false
        }}
      />
    <Stack.Screen 
     name='Message'
     component={MessageScreenWrapper}
     options={{
      headerShown:false,
      gestureEnabled:false
      
     }}/>
       <Stack.Screen
      name='Edit'
      component={EditScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        presentation:'modal'
      }}
      />
        <Stack.Screen
      name='SearchAccount'
      component={OtherUserScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false
      }}/>
    </Stack.Navigator>
  );
}

export default StackNavigation;

