import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { lazy,memo } from 'react';
import { ActivityIndicator, useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';
import LazyScreenComponent from 'app/components/LazyScreenComponent';
const ReportBugScreen = lazy(() => import('../screen/ReportBugScreen'))
const ContactUsScreen = lazy(() => import('../screen/ContactUsScreen'))
const ProjectEntryScreen = lazy(() => import('../screen/ProjectEntryScreen'))
const ChatScreen = lazy(() => import('../screen/ChatScreen'))
const PostScreen = lazy(() => import('../screen/PostScreen'))
const ProjectScreen  = lazy(()=>import('../screen/ProjectScreen'))
const LocationScreen = lazy(()=>import('../screen/LocationScreen'))
const SkillsScreen = lazy(() => import('../screen/SkillScreen'))

const ReportBugScreenWrapper = memo(() => {
    
  return (
    <LazyScreenComponent>
      <ReportBugScreen/>
    </LazyScreenComponent>

  )
})
const ChatScreenWrapper = memo(() => {
  
  return (
    <LazyScreenComponent>
      <ChatScreen/>
    </LazyScreenComponent>
  )

})

const ContactUsScreenWrapper = memo(() => {
  
  return (
    <LazyScreenComponent>
      <ContactUsScreen/>
    </LazyScreenComponent>

  )
})


const ProjectEntryScreenWrapper = memo(() => {
  
  return (
    <LazyScreenComponent>
      <ProjectEntryScreen/>
    </LazyScreenComponent>
  )
})

const PostScreenWrapper = memo(() => {

  return (
    <LazyScreenComponent>
      <PostScreen/>
    </LazyScreenComponent>
  )
})

const LocationScreenWrapper = memo(() => {

  return (
    <LazyScreenComponent>
      <LocationScreen/>
    </LazyScreenComponent>
  )
})

const ProjectScreenWrapper = memo(() => {

  return (
    <LazyScreenComponent>
      <ProjectScreen/>
    </LazyScreenComponent>
  )

})
const SkillsScreenWrapper = memo(() => {
  
  return (
    <LazyScreenComponent>
      <SkillsScreen/>
    </LazyScreenComponent>
  )
})



const SecondStackNavigation = () => {
    const Stack = createNativeStackNavigator();
    const dark_or_light = useColorScheme()
    const theme = useTheme()


 

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
      animation:'fade_from_bottom'
    }}/>

      </Stack.Navigator>
    );
  }
export default SecondStackNavigation