
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { lazy,Suspense, memo } from 'react';
import { useTheme} from 'react-native-paper';
import { Image
 } from 'expo-image';
 import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import NotificationScreen from '../screen/NotificationScreen.tsx';
import SearchScreen from '../screen/SearchScreen.tsx';
import StackNavigation from '../navigation/StackNavigation.tsx';
import ProfileScreen from '../screen/AccountScreen.tsx';




const TabNavigation = () => {
  const Tab = createBottomTabNavigator()
  const theme = useTheme()
  const {user} = useAuth()
  

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
     component={StackNavigation}
     options={{
        tabBarLabel:'Welcome',
        tabBarIcon:() => (
        <MaterialCommunityIcons name='home' color={theme.colors.tertiary} size={25}
        />),   
     }}
     />
     <Tab.Screen
     name='Search'
     component={SearchScreen}
     options={{
      tabBarLabel:'Search',
      tabBarIcon: () => <MaterialCommunityIcons name='account-search' size={25} color={theme.colors.tertiary}/>
     }}
    />
    <Tab.Screen 
        name="Notification"
        component={NotificationScreen}
     options={{
        tabBarLabel: 'Notification',
        tabBarIcon:() => <MaterialIcons name='notifications' color={theme.colors.tertiary} size={25}/>
     }}
     />
     <Tab.Screen 
        name="Account"
        component={ProfileScreen}
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
