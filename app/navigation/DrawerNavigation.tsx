import { createDrawerNavigator } from '@react-navigation/drawer';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import { lazy,Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import TestScreen from '../screen/TestScreen';
import React from 'react';
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon,useTheme} from 'react-native-paper';
const Drawer = createDrawerNavigator();

type  Navigation = {
  Profile:undefined
}

type NavigationProp = NativeStackNavigationProp<Navigation>
const TabNavigation = lazy(() => import('./TabNavigation'))
const ProfileScreen = lazy(() => import('../screen/AccountScreen'))

const TabNavigationWrapper = () =>{
  return (

    <Suspense fallback={<ActivityIndicator size='small' color='#000' />}>
    <TabNavigation/>
  </Suspense>

  )
}

const ProfileScreenWrapper = () =>{
  return (

    <Suspense fallback={<ActivityIndicator size='small' color='#000' />}>
    <ProfileScreen/>
  </Suspense>

  )
}

const DrawerNavigation = () => {
  const {user} = useAuth()
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme()
  return (

    <Drawer.Navigator 
    initialRouteName='Home'
    screenOptions={{
      drawerType:'back',
      drawerStyle:{
        backgroundColor:theme.colors.secondary,
        paddingTop:hp(5),
      },
    }}>
    <Drawer.Screen
        name='Profile'
        component={ProfileScreenWrapper}
        options={{
          headerShown:false,
          drawerLabel:`${user.username}`,
          drawerIcon:({focused,color,size}) => (
            <Image
              style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
              source={{uri:user?.profileUrl}}
              placeholder={{blurhash}}
              />
          )
        }}
      />
      <Drawer.Screen
      name='Home'
      component={TabNavigationWrapper}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="home"
          color="#000"
          size={20}/>
        ),
        headerShown:false,
      }}/>
       <Drawer.Screen
      name='Resource'
      component={TestScreen}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="home"
          color="#000"
          size={20}/>
        ),
        headerShown:false,
      }}/>
       <Drawer.Screen
      name='Code'
      component={TestScreen}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="home"
          color="#000"
          size={20}/>
        ),
        headerShown:false,
      }}/>
    </Drawer.Navigator>

  )
}

export default DrawerNavigation
