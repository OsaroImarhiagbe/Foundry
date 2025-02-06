
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { lazy,Suspense } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
const NotificationScreen = lazy(() => import('../screen/NotificationScreen'))
const SearchScreen = lazy(() => import('../screen/SearchScreen'))
const StackNavigation = lazy(() => import('./StackNavigation'))


const StackNavigationwrapper = () =>{
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <StackNavigation/>
  </Suspense>
  )}



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
        <MaterialCommunityIcons name='home' color={theme.colors.primary} size={25}
        />),   
     }}
     />
     <Tab.Screen
     name='Search'
     component={SearchScreenWrapper}
     options={{
      tabBarLabel:'Search',
      tabBarIcon: () => <MaterialCommunityIcons name='account-search' size={25} color={theme.colors.primary}/>
     }}
    />
    <Tab.Screen 
        name="Notification"
        component={NotificationScreenWrapper}
     options={{
        tabBarLabel: 'Notification',
        tabBarIcon:() => <MaterialIcons name='notifications' color={theme.colors.primary} size={25}/>
     }}
     />
      </Tab.Navigator>
  


  )
}

export default TabNavigation
