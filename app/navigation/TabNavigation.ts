
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { lazy,Suspense } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { Text, BottomNavigation,useTheme } from 'react-native-paper';
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
    <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
    <StackNavigation/>
  </Suspense>
  )}



const SearchScreenWrapper = (props) => {
  
    return(
      <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
        <SearchScreen/>
      </Suspense>
    )}

const NotificationScreenWrapper = (props) => {
  
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
  }}
  tabBar={({ navigation, state, descriptors, insets }) => (
    <BottomNavigation.Bar
    activeIndicatorStyle={{
      backgroundColor:theme.colors.primary
    }}
    keyboardHidesNavigationBar={Platform.OS === 'ios'}
    style={{
    position:'absolute',
    backgroundColor:theme.colors.background,  
    opacity:0.9,
    height:80,
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
        <MaterialCommunityIcons name='home' color={theme.colors.text} size={25}
        />),
        gestureEnabled: false
       
     }}
     />
     <Tab.Screen
     name='Search'
     component={SearchScreenWrapper}
     options={{
      tabBarIcon: () => <MaterialCommunityIcons name='account-search' size={25} color={theme.colors.text}/>
     }}
    />
    <Tab.Screen 
        name="Notification"
        component={NotificationScreenWrapper}
     options={{
        tabBarIcon:() => <MaterialIcons name='notifications' color={theme.colors.text} size={25}/>
     }}
     />
      </Tab.Navigator>
  


  )
}

export default TabNavigation
