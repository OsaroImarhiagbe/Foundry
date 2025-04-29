import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
import LazyScreenComponent from '../components/BasicComponents/LazyScreenComponent.tsx';
const ReportBugScreen = React.lazy(() => import('../screen/MainStackScreens-1/ReportBugScreen.tsx'));
const ContactUsScreen = React.lazy(() => import('../screen/MainStackScreens-1/ContactUsScreen.tsx'));
const LocationScreen = React.lazy(() => import('../screen/MainStackScreens-1/LocationScreen.tsx'));
const EditScreen = React.lazy(() => import('../screen/MainStackScreens-1/EditScreen.tsx'));
const ProjectEntryScreen = React.lazy(() => import('../screen/MainStackScreens-1/ProjectEntryScreen.tsx'));
const ProfileScreen = React.lazy(() => import('../screen/MainStackScreens-1/AccountScreen.tsx'));
const SkillsScreen = React.lazy(() => import('../screen/MainStackScreens-1/SkillScreen.tsx'));


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


const  ProjectEntryScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ProjectEntryScreen/>
    </LazyScreenComponent>
  )
});


const LocationScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <LocationScreen/>
    </LazyScreenComponent>
  )
})
const EditScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <EditScreen/>
    </LazyScreenComponent>
  )

});
const ProfileScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ProfileScreen/>
    </LazyScreenComponent>
  )
});
const SkillsScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <SkillsScreen/>
    </LazyScreenComponent>
  )
});






const SecondStackNavigation = () => {
    const Stack = createNativeStackNavigator()
    return (
  <Stack.Navigator
  initialRouteName='Profile'
  screenOptions={{
    gestureEnabled:false,}}>
  <Stack.Screen
      name='Profile'
      component={ProfileScreenWrapper}
      options={{
        headerShown:false,
        gestureEnabled:false,
      }}
      />
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
export default SecondStackNavigation