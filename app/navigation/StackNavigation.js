import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { lazy,Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
const HomeScreen = lazy(() => import('../screen/HomeScreen'))
const ChatScreen = lazy(() => import('../screen/ChatScreen'))
const MessageScreen = lazy(() => import('../screen/MessageScreen'))
const AccountScreen = lazy(() => import('../screen/AccountScreen'))
const PostScreen = lazy(() => import('../screen/PostScreen'))
const EditScreen = lazy(() => import('../screen/EditScreen'))
const OtherUserScreen = lazy(() => import('../screen/OtherUserScreen'))
const EditInputScreen = lazy(() => import('../screen/EditInputScreen'))
const EditEmailScreen = lazy(() => import('../screen/EditEmailScreen'))
const EditPhoneScreen = lazy(() => import('../screen/EditPhoneScreen'))
const EditJobScreen = lazy(() => import('../screen/EditJobScreen'))

const ChatScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <ChatScreen  {...props}/>
  </Suspense>

  )

}
const MessageScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <MessageScreen  {...props}/>
  </Suspense>

  )

}
const ProfileScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <AccountScreen/>
  </Suspense>

  )

}
const PostScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <PostScreen  {...props}/>
  </Suspense>

  )

}

const HomeScreenWrapper = (props) => {
  
  return(
    <Suspense fallback={<ActivityIndicator size='small' color='"#000'/>}>
    <HomeScreen {...props}/>
  </Suspense>
  )}

const EditScreenWrapper = (props) => {
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <EditScreen  {...props}/>
  </Suspense>
  )
}

const OtherUserScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <OtherUserScreen/>
  </Suspense>

  )

}

const EditInputScreenWrapper = () =>{
  return (
      <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <EditInputScreen/>
    </Suspense>
  )
}

const EditEmailScreenWrapper = () => {
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <EditEmailScreen/>
    </Suspense>
  )
}

const EditPhoneScreenWrapper = () => {
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <EditPhoneScreen/>
  </Suspense>
  )
}

const EditJobScreenWrapper = () => {
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <EditJobScreen/>
  </Suspense>
  )
}
const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

const Stack = createNativeStackNavigator();

const StackNavigation = () => {

 

  return (
    <Stack.Navigator
    screenOptions={{
      unmountOnBlur: true,
    }}
    initialRouteName='Main'>
      <Stack.Screen
        name='Main'
        component={HomeScreenWrapper}
        options={{
        headerShown: false, 
        gestureEnabled:false,
        unmountOnBlur: true,}}
      />
    <Stack.Screen 
     name='Message'
     component={MessageScreenWrapper}
     options={{
      headerShown:false,
      gestureEnabled:false,
      unmountOnBlur: true,
     }}/>
      <Stack.Screen
      name='Chat'
      component={ChatScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        unmountOnBlur: true,
      }}
      />
      <Stack.Screen
      name='Profile'
      component={ProfileScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        unmountOnBlur: true,
      }}/>
      <Stack.Screen
      name='Post'
      component={PostScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        unmountOnBlur: true,
      }}
      />
       <Stack.Screen
      name='Edit'
      component={EditScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        unmountOnBlur: true,
      }}
      />
        <Stack.Screen
      name='SearchAccount'
      component={OtherUserScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        unmountOnBlur: true,
      }}/>
      <Stack.Screen
      name='EditUser'
      component={EditInputScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        presentation:'modal',
        unmountOnBlur: true,
      }}/>
        <Stack.Screen
      name='EditEmail'
      component={EditEmailScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        presentation:'modal',
        unmountOnBlur: true,
      }}/>
         <Stack.Screen
      name='EditPhone'
      component={EditPhoneScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        presentation:'modal',
        unmountOnBlur: true,
      }}/>
           <Stack.Screen
      name='EditJob'
      component={EditJobScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
        presentation:'modal',
        unmountOnBlur: true,
      }}/>
    </Stack.Navigator>
  );
}

export default StackNavigation;

