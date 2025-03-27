import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
import LazyScreenComponent from '../components/LazyScreenComponent.tsx';
const MessageScreen = React.lazy(() => import('../screen/MessageScreen.tsx'))
const EditScreen = React.lazy(() => import('../screen/EditScreen.tsx'));
const OtherUserScreen = React.lazy(() => import('../screen/OtherUserScreen.tsx'));
const DashBoardScreen = React.lazy(() => import('../screen/DashBoardScreen.tsx'));
const ProjectEntryScreen = React.lazy(() => import('../screen/ProjectEntryScreen.tsx'));
const SkillsScreen = React.lazy(() => import('../screen/SkillScreen.tsx'));
const ChatScreen = React.lazy(() => import('../screen/ChatScreen.tsx'));
const PostScreen = React.lazy(() => import('../screen/PostScreen.tsx'));
const ProjectScreen = React.lazy(() => import('../screen/ProjectScreen.tsx'));
const MessageScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <MessageScreen/>
    </LazyScreenComponent>
  )

});
const  ProjectEntryScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ProjectEntryScreen/>
    </LazyScreenComponent>
  )
});

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
});
const ChatScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ChatScreen/>
    </LazyScreenComponent>
  )
});
const PostScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <PostScreen/>
    </LazyScreenComponent>
  )
});
const ProjectScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ProjectScreen/>
    </LazyScreenComponent>
  )
});


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
       }}
      />
    <Stack.Screen 
     name='Message'
     component={MessageScreenWrapper}
     options={{
      headerShown:false,
      gestureEnabled:false,
     }}/>
       <Stack.Screen
      name='Edit'
      component={EditScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
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
    <Stack.Screen
      name='Chat'
      component={ChatScreenWrapper}
      options={{
      headerShown:false,
      gestureEnabled:false,
      presentation:'fullScreenModal'
      }}/>
    <Stack.Screen
      name='Post'
      component={PostScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        animation:'slide_from_bottom',
        animationDuration:500
      }}
      />
    <Stack.Screen
    name="ProjectScreen"
    component={ProjectScreenWrapper}
    options={{
        headerShown:false,
        gestureEnabled:false,
        presentation:'fullScreenModal'
    }}/>
    </Stack.Navigator>
  );
}

export default StackNavigation;

