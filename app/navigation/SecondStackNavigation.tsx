import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { memo } from 'react';
import ReportBugScreen from '../screen/ReportBugScreen.tsx';
import ContactUsScreen from '../screen/ContactUsScreen.tsx';
import ProjectEntryScreen from '../screen/ProjectEntryScreen.tsx';
import ChatScreen from '../screen/ChatScreen.tsx';
import PostScreen from '../screen/PostScreen.tsx';
import ProjectScreen from '../screen/ProjectScreen.tsx';
import LocationScreen from '../screen/LocationScreen.tsx';
import SkillsScreen from '../screen/SkillScreen.tsx';




const SecondStackNavigation = () => {
    const Stack = createNativeStackNavigator()
    return (
      <Stack.Navigator>
    <Stack.Screen
      name='Post'
      component={PostScreen}
      options={{
        headerShown:false,
        gestureEnabled:false,
      }}
      />
    <Stack.Screen
    name="ProjectScreen"
    component={ProjectScreen}
    options={{
        headerShown:false,
        
    }}/>
        <Stack.Screen
    name="LocationScreen"
    component={LocationScreen}
    options={{
        headerShown:false,
        
    }}/>
    <Stack.Screen
    name="ReportBugScreen"
    component={ReportBugScreen}
    options={{
        headerShown:false,
        
    }}/>
        <Stack.Screen
    name="ContactUsScreen"
    component={ContactUsScreen}
    options={{
        headerShown:false,
        
    }}/>
    <Stack.Screen
    name="ProjectEntryScreen"
    component={ProjectEntryScreen}
    options={{
        headerShown:false,
        presentation:'modal'
    }}/>
    <Stack.Screen
      name='Chat'
      component={ChatScreen}
      options={{
      headerShown:false,
      gestureEnabled:false
      }}
        />
  <Stack.Screen
    name="SkillScreen"
    component={SkillsScreen}
    options={{
      headerShown:false,
      animation:'fade_from_bottom'
    }}/>

      </Stack.Navigator>
    );
  }
export default SecondStackNavigation