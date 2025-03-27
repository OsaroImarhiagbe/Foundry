import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
import LazyScreenComponent from '../components/LazyScreenComponent.tsx';
const ReportBugScreen = React.lazy(() => import('../screen/ReportBugScreen.tsx'));
const ContactUsScreen = React.lazy(() => import('../screen/ContactUsScreen.tsx'));
const ChatScreen = React.lazy(() => import('../screen/ChatScreen.tsx'));
const PostScreen = React.lazy(() => import('../screen/PostScreen.tsx'));
const ProjectScreen = React.lazy(() => import('../screen/ProjectScreen.tsx'));
const LocationScreen = React.lazy(() => import('../screen/LocationScreen.tsx'));



const ReportBugScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ReportBugScreen/>
    </LazyScreenComponent>
  )
})

const ContactUsScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ContactUsScreen/>
    </LazyScreenComponent>
  )
})


const ChatScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ChatScreen/>
    </LazyScreenComponent>
  )
})

const PostScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <PostScreen/>
    </LazyScreenComponent>
  )
})

const ProjectScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ProjectScreen/>
    </LazyScreenComponent>
  )
})

const LocationScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <LocationScreen/>
    </LazyScreenComponent>
  )
})






const SecondStackNavigation = () => {
    const Stack = createNativeStackNavigator()
    return (
      <Stack.Navigator
      initialRouteName='Post' 
      screenOptions={{
        gestureEnabled:false
      }}>
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
    component={ProjectScreenWrapper}
    options={{
        headerShown:false,
        
    }}/>
        <Stack.Screen
    name="LocationScreen"
    component={LocationScreenWrapper}
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