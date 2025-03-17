import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import MessageScreen from '../screen/MessageScreen.tsx';
import EditScreen from '../screen/EditScreen.tsx';
import OtherUserScreen from '../screen/OtherUserScreen.tsx';
import DashBoardScreen from '../screen/DashBoardScreen.tsx';



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
     component={MessageScreen}
     options={{
      headerShown:false,
      gestureEnabled:false
      
     }}/>
       <Stack.Screen
      name='Edit'
      component={EditScreen}
      options={{
        headerShown:false,
        gestureEnabled:false,
        presentation:'modal'
      }}
      />
        <Stack.Screen
      name='SearchAccount'
      component={OtherUserScreen}
      options={{
        headerShown:false,
        gestureEnabled:false
      }}/>
    </Stack.Navigator>
  );
}

export default StackNavigation;

