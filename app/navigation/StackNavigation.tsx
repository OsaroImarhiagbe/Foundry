import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { lazy,Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import  DashBoardScreen  from '../screen/DashBoardScreen';
const HomeScreen = lazy(() => import('../screen/HomeScreen'))
const MessageScreen = lazy(() => import('../screen/MessageScreen'))
const EditScreen = lazy(() => import('../screen/EditScreen'))
const OtherUserScreen = lazy(() => import('../screen/OtherUserScreen'))


const MessageScreenWrapper = () => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <MessageScreen/>
  </Suspense>

  )

}
const HomeScreenWrapper = () => {
  
  return(
    <Suspense fallback={<ActivityIndicator size='small' color='"#000'/>}>
    <HomeScreen/>
  </Suspense>
  )}

const EditScreenWrapper = () => {
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <EditScreen />
  </Suspense>
  )
}

const OtherUserScreenWrapper = () => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <OtherUserScreen/>
  </Suspense>

  )

}
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

