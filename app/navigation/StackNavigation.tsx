import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
import LazyScreenComponent from '../components/LazyScreenComponent.tsx';
const MessageScreen = React.lazy(() => import('../screen/MessageScreen.tsx'))
const EditScreen = React.lazy(() => import('../screen/EditScreen.tsx'));
const OtherUserScreen = React.lazy(() => import('../screen/OtherUserScreen.tsx'));
const DashBoardScreen = React.lazy(() => import('../screen/DashBoardScreen.tsx'));
const ProjectEntryScreen = React.lazy(() => import('../screen/ProjectEntryScreen.tsx'));
const SkillsScreen = React.lazy(() => import('../screen/SkillScreen.tsx'));
const MessageScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <MessageScreen/>
    </LazyScreenComponent>
  )

})
const  ProjectEntryScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ProjectEntryScreen/>
    </LazyScreenComponent>
  )
})

const OtherUserScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <OtherUserScreen/>
    </LazyScreenComponent>
  )

})

const EditScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <EditScreen/>
    </LazyScreenComponent>
  )

})

const DashBoardScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <DashBoardScreen/>
    </LazyScreenComponent>
  )

})
const SkillsScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <SkillsScreen/>
    </LazyScreenComponent>
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
  <Stack.Screen
    name="ProjectEntryScreen"
    component={ProjectEntryScreenWrapper}
    options={{
        headerShown:false,
        presentation:'modal'
    }}/>
      <Stack.Screen
    name="SkillScreen"
    component={SkillsScreenWrapper}
    options={{
      headerShown:false,
      gestureEnabled:false,
      presentation:'modal'
    }}/>
    </Stack.Navigator>
  );
}

export default StackNavigation;

