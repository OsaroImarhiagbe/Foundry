import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
import FallBackComponent from '../components/FallBackComponent.tsx';
const ReportBugScreen = React.lazy(() => import('../screen/ReportBugScreen.tsx'));
const ContactUsScreen = React.lazy(() => import('../screen/ContactUsScreen.tsx'));
const ProjectEntryScreen = React.lazy(() => import('../screen/ProjectEntryScreen.tsx'));
const ChatScreen = React.lazy(() => import('../screen/ChatScreen.tsx'));
const PostScreen = React.lazy(() => import('../screen/PostScreen.tsx'));
const ProjectScreen = React.lazy(() => import('../screen/ProjectScreen.tsx'));
const LocationScreen = React.lazy(() => import('../screen/LocationScreen.tsx'));
const SkillsScreen = React.lazy(() => import('../screen/SkillScreen.tsx'));


const ReportBugScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <ReportBugScreen/>
    </Suspense>
  )
})

const ContactUsScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <ContactUsScreen/>
    </Suspense>
  )
})

const  ProjectEntryScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <ProjectEntryScreen/>
    </Suspense>
  )
})

const ChatScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <ChatScreen/>
    </Suspense>
  )
})

const PostScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <PostScreen/>
    </Suspense>
  )
})

const ProjectScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <ProjectScreen/>
    </Suspense>
  )
})

const LocationScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <LocationScreen/>
    </Suspense>
  )
})

const SkillsScreenWrapper = React.memo(() => {
  return (
    <Suspense fallback={<FallBackComponent/>}>
      <SkillsScreen/>
    </Suspense>
  )
})




const SecondStackNavigation = () => {
    const Stack = createNativeStackNavigator()
    return (
      <Stack.Navigator 
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
    name="ProjectEntryScreen"
    component={ProjectEntryScreenWrapper}
    options={{
        headerShown:false,
        presentation:'modal'
    }}/>
    <Stack.Screen
      name='Chat'
      component={ChatScreenWrapper}
      options={{
      headerShown:false,
      gestureEnabled:false
      }}
        />
  <Stack.Screen
    name="SkillScreen"
    component={SkillsScreenWrapper}
    options={{
      headerShown:false,
    }}/>

      </Stack.Navigator>
    );
  }
export default SecondStackNavigation