
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { lazy,Suspense, memo } from 'react';
import { useTheme,Text} from 'react-native-paper';
import { Image
 } from 'expo-image';
 import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import LazyScreenComponent from '../components/LazyScreenComponent.tsx';
import {useNotification} from '../NotificationProvider.tsx'
const NotificationScreen = React.lazy(() => import('../screen/NotificationScreen.tsx'));
const SearchScreen = React.lazy(() => import('../screen/SearchScreen.tsx'));
const StackNavigation = React.lazy(() => import('../navigation/StackNavigation.tsx'));
const ProfileScreen = React.lazy(() => import('../screen/AccountScreen.tsx'));

const ProfileScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <ProfileScreen/>
    </LazyScreenComponent>
  )
})

const SearchScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <SearchScreen/>
    </LazyScreenComponent>
  )
})

const NotificationScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <NotificationScreen/>
    </LazyScreenComponent>
  )
})

const StackNavigationWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <StackNavigation/>
    </LazyScreenComponent>
  )
})





const TabNavigation = () => {
  const Tab = createBottomTabNavigator()
  const theme = useTheme()
  const {user} = useAuth()
  const {notificationCount} = useNotification()
  

  return (
 
  <Tab.Navigator 
  initialRouteName='Welcome'
  screenOptions={{
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: {
      borderTopWidth: 0.5,
      borderColor:theme.colors.primary,
      backgroundColor: theme.colors.background,
      elevation: 0, 
      shadowOpacity: 0, 
    }
  }}
>

  <Tab.Screen 
      name="Welcome"
     component={StackNavigationWrapper}
     options={{
        tabBarLabel:'Welcome',
        tabBarIcon:() => (
        <MaterialCommunityIcons name='home' color={theme.colors.tertiary} size={25}
        />),   
     }}
     />
     <Tab.Screen
     name='Search'
     component={SearchScreenWrapper}
     options={{
      tabBarLabel:'Search',
      tabBarIcon: () => <MaterialCommunityIcons name='account-search' size={25} color={theme.colors.tertiary}/>
     }}
    />
    <Tab.Screen 
        name="Notification"
        component={NotificationScreenWrapper}
     options={{
      tabBarBadge: notificationCount,
      tabBarLabel: 'Notification',
      tabBarIcon:() => (<MaterialIcons name='notifications' color={theme.colors.tertiary} size={25}/>)
     }}
     />
     <Tab.Screen 
        name="Account"
        component={ProfileScreenWrapper}
        options={{
          tabBarIcon:() => (
            user?.profileUrl ?
            <Image
            style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
            source={{uri:user?.profileUrl}}
            placeholder={{blurhash}}
            /> :  <Image
            style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
            source={require('../assets/user.png')}
            placeholder={{blurhash}}
            />
          )}}
     />

      </Tab.Navigator>
  


  )
}

export default TabNavigation
