import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
const MessageScreen = React.lazy(() => import('../screen/MessageScreen.tsx'))
const EditScreen = React.lazy(() => import('../screen/EditScreen.tsx'));
const OtherUserScreen = React.lazy(() => import('../screen/OtherUserScreen.tsx'));
import DashBoardScreen from '../screen/DashBoardScreen.tsx';


const MessageScreenWrapper = () => {
  return (
    <Suspense>
      <MessageScreen/>
    </Suspense>
  )

}

const OtherUserScreenWrapper = () => {
  return (
    <Suspense>
      <OtherUserScreen/>
    </Suspense>
  )

}

const EditScreenWrapper = () => {
  return (
    <Suspense>
      <EditScreen/>
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

