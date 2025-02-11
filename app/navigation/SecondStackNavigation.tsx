import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { lazy,Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
const ReportBugScreen = lazy(() => import('../screen/ReportBugScreen'))
const ContactUsScreen = lazy(() => import('../screen/ContactUsScreen'))
const ProjectEntryScreen = lazy(() => import('../screen/ProjectEntryScreen'))
const SkillsScreen = lazy(() => import('../screen/SkillsScreen'))
const ChatScreen = lazy(() => import('../screen/ChatScreen'))
const PostScreen = lazy(() => import('../screen/PostScreen'))
const DashBoardScreen = lazy(()=>import('../screen/DashBoardScreen'))
const ProjectScreen  = lazy(()=>import('../screen/ProjectScreen'))
const LocationScreen = lazy(()=>import('../screen/LocationScreen'))

  
const ReportBugScreenWrapper = () => {
    
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <ReportBugScreen/>
    </Suspense>
  
    )
  }
  const ChatScreenWrapper = () => {
    
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <ChatScreen />
    </Suspense>
    )
  
  }

  const ContactUsScreenWrapper = () => {
    
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <ContactUsScreen/>
    </Suspense>
  
    )
  }
  const SkillsScreenWrapper = () => {
    
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <SkillsScreen/>
    </Suspense>
  
    )
  }
  
  const ProjectEntryScreenWrapper = () => {
    
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <ProjectEntryScreen/>
    </Suspense>
  
    )
  }

  const PostScreenWrapper = () => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <PostScreen/>
    </Suspense>
  
    )
  
  }

const SecondStackNavigation = () => {
    const Stack = createNativeStackNavigator();

 

    return (
      <Stack.Navigator>
    <Stack.Screen
      name='Post'
      component={PostScreenWrapper}
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
    component={ReportBugScreenWrapper}
    options={{
        headerShown:false,
        
    }}/>
        <Stack.Screen
    name="ContactUsScreen"
    component={ContactUsScreenWrapper}
    options={{
        headerShown:false,
        
    }}/>
    <Stack.Screen
    name="ProjectEntryScreen"
    component={ProjectEntryScreenWrapper}
    options={{
        headerShown:false,
       
    }}/>
        <Stack.Screen
    name="SkillsScreen"
    component={SkillsScreenWrapper}
    options={{
        headerShown:false,
       
    }}/>
    <Stack.Screen
      name='Chat'
      component={ChatScreenWrapper}
      options={{
      headerShown:false,
      gestureEnabled:false
      }}
        />
      </Stack.Navigator>
    );
  }
export default SecondStackNavigation