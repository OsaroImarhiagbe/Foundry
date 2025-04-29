import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
import LazyScreenComponent from '../components/BasicComponents/LazyScreenComponent.tsx';
const MessageScreen = React.lazy(() => import('../screen/MainStackScreens/MessageScreen.tsx'))
const OtherUserScreen = React.lazy(() => import('../screen/MainStackScreens/OtherUserScreen.tsx'));
const DashBoardScreen = React.lazy(() => import('../screen/MainStackScreens/DashBoardScreen.tsx'));
const ChatScreen = React.lazy(() => import('../screen/MainStackScreens/ChatScreen.tsx'));
const PostScreen = React.lazy(() => import('../screen/MainStackScreens/PostScreen.tsx'));
const ProjectScreen = React.lazy(() => import('../screen//MainStackScreens/ProjectScreen.tsx'));
const MessageScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <MessageScreen/>
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

const DashBoardScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <DashBoardScreen/>
    </LazyScreenComponent>
  )

})
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
    <Stack.Navigator initialRouteName='Dash'>
    <Stack.Screen
    name='Dash'
    component={DashBoardScreenWrapper}
    options={{
      headerShown: false, 
    }}/>
    <Stack.Screen 
     name='Message'
     component={MessageScreenWrapper}
     options={{
      headerShown:false,
      gestureEnabled:false,
     }}/>
    <Stack.Screen
      name='SearchAccount'
      component={OtherUserScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false
      }}/>
    <Stack.Screen
      name='Chat'
      component={ChatScreenWrapper}
      options={{
      headerShown:false,
      gestureEnabled:false,
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

