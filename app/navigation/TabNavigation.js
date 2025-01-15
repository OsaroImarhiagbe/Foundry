
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { lazy,Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

const NotificationScreen = lazy(() => import('../screen/NotificationScreen'))
const SearchScreen = lazy(() => import('../screen/SearchScreen'))
const StackNavigation = lazy(() => import('./StackNavigation'))


const StackNavigationwrapper = (props) =>{
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='"#000'/>}>
    <StackNavigation/>
  </Suspense>
  )}



const SearchScreenWrapper = (props) => {
  
    return(
      <Suspense fallback={<ActivityIndicator size='small' color='"#000'/>}>
        <SearchScreen/>
      </Suspense>
    )}

const NotificationScreenWrapper = (props) => {
  
      return(
        <Suspense fallback={<ActivityIndicator size='small' color='"#000'/>}>
        <NotificationScreen/>
      </Suspense>
      )}


const TabNavigation = () => {
  const Tab = createBottomTabNavigator()


  return (
 
  <Tab.Navigator 
  initialRouteName='Welcome'
  screenOptions={{
    headerShown: false, 
    tabBarStyle: {
      position: 'absolute',
      backgroundColor:'#252525',  
      height:70,
      borderTopWidth: 0,
      paddingVertical: 0, // Ensure no vertical padding
      paddingHorizontal: 0, 
    },
    tabBarActiveBackgroundColor:'#252525',
    tabBarShowLabel: false,                  
  }}
>
    <Tab.Screen 
      name="Welcome"
     component={StackNavigationwrapper}
     options={{
        tabBarIcon:() => (
        <MaterialCommunityIcons name='home' color='#00bf63' size={25}
        />),
        gestureEnabled: false
       
     }}
     />
     <Tab.Screen
     name='Search'
     component={SearchScreenWrapper}
     options={{
      tabBarIcon: () => <MaterialCommunityIcons name='account-search' size={25} color='#00bf63'/>
     }}
    />
    <Tab.Screen 
        name="Notification"
        component={NotificationScreenWrapper}
     options={{
        tabBarIcon:() => <MaterialIcons name='notifications' color='#00bf63' size={25}/>
     }}
     />
      </Tab.Navigator>
  


  )
}

export default TabNavigation
