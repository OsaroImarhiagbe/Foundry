
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { lazy,Suspense } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { useTheme,} from 'react-native-paper';
import { Image
 } from 'expo-image';
 import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
const NotificationScreen = lazy(() => import('../screen/NotificationScreen'))
const SearchScreen = lazy(() => import('../screen/SearchScreen'))
const StackNavigation = lazy(() => import('./StackNavigation'))
const ProfileScreen = lazy(() => import('../screen/AccountScreen'))


const StackNavigationwrapper = () =>{
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <StackNavigation/>
  </Suspense>
  )}

  const ProfileScreenWrapper = () =>{
    return (
  
      <Suspense fallback={<ActivityIndicator size='small' color='#000' />}>
      <ProfileScreen/>
    </Suspense>
  
    )
  }

const SearchScreenWrapper = () => {
  
    return(
      <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
        <SearchScreen/>
      </Suspense>
    )}

const NotificationScreenWrapper = () => {
  
      return(
        <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
        <NotificationScreen/>
      </Suspense>
      )}


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
    tabBarStyle:{
      borderTopWidth:0,
      backgroundColor:theme.colors.background
    }
  }}
>
    <Tab.Screen 
      name="Welcome"
     component={StackNavigationwrapper}
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
        tabBarLabel: 'Notification',
        tabBarIcon:() => <MaterialIcons name='notifications' color={theme.colors.tertiary} size={25}/>
     }}
     />
     <Tab.Screen 
        name="Profile"
        component={ProfileScreenWrapper}
        options={{
          tabBarIcon:({focused,color,size}) => (
            <Image
            style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
            source={{uri:user?.profileUrl}}
            placeholder={{blurhash}}
            />
          )}}
     />
      </Tab.Navigator>
  


  )
}

export default TabNavigation
