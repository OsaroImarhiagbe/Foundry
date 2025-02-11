import { createDrawerNavigator, DrawerItem,DrawerContentScrollView,DrawerItemList } from '@react-navigation/drawer';
import { NavigatorScreenParams} from '@react-navigation/native';
import { lazy,Suspense } from 'react';
import { ActivityIndicator,TouchableWithoutFeedback,View, } from 'react-native';
import TestScreen from '../screen/TestScreen';
import React from 'react';
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Icon,useTheme,} from 'react-native-paper';
const Drawer = createDrawerNavigator();



const TabNavigation = lazy(() => import('./TabNavigation'))
const ProfileScreen = lazy(() => import('../screen/AccountScreen'))

const TabNavigationWrapper = () =>{
  return (

    <Suspense fallback={<ActivityIndicator size='small' color='#000' />}>
    <TabNavigation/>
  </Suspense>

  )
}

const DrawerNavigation = () => {
  const theme = useTheme()
  const {user} = useAuth()
  return (

    <Drawer.Navigator
    initialRouteName='Home'
    drawerContent={props => (
      <DrawerContentScrollView {...props}>
          <View style={{ padding: 10 }}>
           <TouchableWithoutFeedback  onPress={() => props.navigation.navigate('Home',{screen:'Account'})}>
           <Image
            style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
            source={{uri:user?.profileUrl}}
            placeholder={{blurhash}}
            />
            </TouchableWithoutFeedback> 
          </View>
          <DrawerItemList {...props} />
          <DrawerItem
              label="Something"
              labelStyle={{
                color:theme.colors.onPrimary
              }}
              icon={ () => (<Icon
                source="home"
                color={theme.colors.secondary}
                size={20}/>)}
              onPress={() => console.log('hello')}
          />
      </DrawerContentScrollView>
    )}
    screenOptions={{
      drawerType:'back',
      drawerStyle:{
        backgroundColor:theme.colors.background,
        paddingTop:hp(5),
      },
    }}>
      <Drawer.Screen
      name='Home'
      component={TabNavigationWrapper}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="home"
          color={theme.colors.secondary}
          size={20}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary
        },
        headerShown:false,
      }}/>
       <Drawer.Screen
      name='Resource'
      component={TestScreen}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="source-branch"
          color={theme.colors.secondary}
          size={20}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary,
        },
        headerShown:false,
      }}/>
       <Drawer.Screen
      name='Code'
      component={TestScreen}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="code-tags"
          color={theme.colors.secondary}
          size={20}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary
        },
        headerShown:false,
      }}/>
    </Drawer.Navigator>

  )
}

export default DrawerNavigation
