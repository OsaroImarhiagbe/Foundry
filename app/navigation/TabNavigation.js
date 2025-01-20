
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { lazy,Suspense } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { Text, BottomNavigation } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
const NotificationScreen = lazy(() => import('../screen/NotificationScreen'))
const SearchScreen = lazy(() => import('../screen/SearchScreen'))
const StackNavigation = lazy(() => import('./StackNavigation'))

// {
//   index: 1,
//   routes: [
//     { key: 'music', title: 'Favorites', focusedIcon: 'heart', unfocusedIcon: 'heart-outline'},
//     { key: 'albums', title: 'Albums', focusedIcon: 'album' },
//     { key: 'recents', title: 'Recents', focusedIcon: 'history' },
//     { key: 'notifications', title: 'Notifications', focusedIcon: 'bell', unfocusedIcon: 'bell-outline' },
//   ]
// }


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
    tabBarShowLabel: false,
    tabBarActiveTintColor:'#252525'         
  }}
  tabBar={({ navigation, state, descriptors, insets }) => (
    <BottomNavigation.Bar
    keyboardHidesNavigationBar={Platform.OS === 'ios'}
    activeColor='#252525'
    inactiveColor='red'
    activeIndicatorStyle='#252525'
    style={{
    position:'absolute',
    backgroundColor:'#252525',  
    height:hp('10%'),
    borderTopWidth: 0,
    paddingHorizontal: 0,
    paddingVertical:0,
    }}
    navigationState={state}
     safeAreaInsets={insets}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
        } else {
         navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: state.key,
          });
        }
      }}
      renderIcon={({ route, focused, color }) => {
        const { options } = descriptors[route.key];
        if (options.tabBarIcon) {
          return options.tabBarIcon({ focused, color, size: 24 });
        }

        return null;
      }}
      getLabelText={({ route }) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.title;

        return label;
      }}
    />
  )}
>
    <Tab.Screen 
      name="Welcome"
     component={StackNavigationwrapper}
     options={{
        tabBarIcon:() => (
        <MaterialCommunityIcons name='home' color='#00bf63' size={20}
        />),
        gestureEnabled: false
       
     }}
     />
     <Tab.Screen
     name='Search'
     component={SearchScreenWrapper}
     options={{
      tabBarIcon: () => <MaterialCommunityIcons name='account-search' size={20} color='#00bf63'/>
     }}
    />
    <Tab.Screen 
        name="Notification"
        component={NotificationScreenWrapper}
     options={{
        tabBarIcon:() => <MaterialIcons name='notifications' color='#00bf63' size={20}/>
     }}
     />
      </Tab.Navigator>
  


  )
}

export default TabNavigation
