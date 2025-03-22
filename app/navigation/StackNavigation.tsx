import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
import FallBackComponent from '../components/FallBackComponent.tsx';
const MessageScreen = React.lazy(() => import('../screen/MessageScreen.tsx'))
const EditScreen = React.lazy(() => import('../screen/EditScreen.tsx'));
const OtherUserScreen = React.lazy(() => import('../screen/OtherUserScreen.tsx'));
const DashBoardScreen = React.lazy(() => import('../screen/DashBoardScreen.tsx'));


const MessageScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <MessageScreen/>
    </Suspense>
  )

})

const OtherUserScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <OtherUserScreen/>
    </Suspense>
  )

})

const EditScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <EditScreen/>
    </Suspense>
  )

})

const DashBoardScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <DashBoardScreen/>
    </Suspense>
  )

})


const StackNavigation = () => {
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
    initialRouteName='Dash'>
        <Stack.Screen
        name='Dash'
        component={DashBoardScreenWrapper}
        options={{
        headerShown: false, 
        gestureEnabled:false,
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

