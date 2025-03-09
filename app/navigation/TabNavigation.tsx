
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { lazy,Suspense, memo } from 'react';
import { ActivityIndicator, useColorScheme} from 'react-native';
import { useTheme} from 'react-native-paper';
import { Image
 } from 'expo-image';
 import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import LazyScreenComponent from 'app/components/LazyScreenComponent';
const NotificationScreen = lazy(() => import('../screen/NotificationScreen'))
const SearchScreen = lazy(() => import('../screen/SearchScreen'))
const StackNavigation = lazy(() => import('./StackNavigation'))
const ProfileScreen = lazy(() => import('../screen/AccountScreen'))


const StackNavigationwrapper = () =>{
  return (
    <LazyScreenComponent>
      <StackNavigation/>
    </LazyScreenComponent>
  )}

const ProfileScreenWrapper = () =>{
    return (
  
     <LazyScreenComponent>
      <ProfileScreen/>
     </LazyScreenComponent>
  
    )
  }
const SearchScreenWrapper = () => {
  return(
  <LazyScreenComponent>
    <SearchScreen/>
  </LazyScreenComponent>
  )
}
const NotificationScreenWrapper = () => {
  return(
    <LazyScreenComponent>
      <NotificationScreen/>
    </LazyScreenComponent>
    )
  }



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
