import { createDrawerNavigator, DrawerItem,DrawerContentScrollView, DrawerNavigationProp,DrawerItemList } from '@react-navigation/drawer';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import { lazy,Suspense } from 'react';
import { ActivityIndicator,TouchableWithoutFeedback,View, } from 'react-native';
import TestScreen from '../screen/TestScreen';
import React from 'react';
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon,useTheme,Text} from 'react-native-paper';
const Drawer = createDrawerNavigator();

type Navigation = {
  Home?:{
    screen?:string
  }
  Resource: undefined;
  Code: undefined;
  Profile: undefined;
};


type DrawerNavProp = DrawerNavigationProp<Navigation>;
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
const CustomDrawerContent = (props:any) => {
  const navigation = useNavigation<DrawerNavProp>();
  const theme = useTheme()
  const {user} = useAuth()

  return (
      <DrawerContentScrollView {...props}>
          <View style={{ padding: 10 }}>
           <TouchableWithoutFeedback onPress={() => navigation.navigate('Profile')}>
           <Image
            style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
            source={{uri:user?.profileUrl}}
            placeholder={{blurhash}}
            />
            </TouchableWithoutFeedback> 
          </View>
          <DrawerItemList {...props} />
          <DrawerItem
              label="Home"
              labelStyle={{
                color:theme.colors.onPrimary
              }}
              icon={ () => (<Icon
                source="home"
                color={theme.colors.secondary}
                size={20}/>)}
              onPress={() => navigation.navigate('Home')}
          />
          <DrawerItem
              label="Profile"
              labelStyle={{
                color:theme.colors.onPrimary
              }}
              icon={ () => (<Icon
                source="home"
                color={theme.colors.secondary}
                size={20}/>)}
              onPress={() => navigation.navigate('Code')}
          />
          <DrawerItem
              label="Settings"
              labelStyle={{
                color:theme.colors.onPrimary
              }}
              icon={ () => (<Icon
                source="home"
                color={theme.colors.secondary}
                size={20}/>)}
              onPress={() => console.log('User logged out')}
          />
          <DrawerItem
              label="Logout"
              labelStyle={{
                color:theme.colors.onPrimary
              }}
              icon={ () => (<Icon
                source="home"
                color={theme.colors.secondary}
                size={20}/>)}
              onPress={() => console.log('User logged out')}
          />
      </DrawerContentScrollView>
  );
};

const DrawerNavigation = () => {
  const {user} = useAuth()
  const navigation = useNavigation<Navigation>();
  const theme = useTheme()
  return (

    <Drawer.Navigator
    initialRouteName='Home'
    drawerContent={(props) => <CustomDrawerContent {...props} />}
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
