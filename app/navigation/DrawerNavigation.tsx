import { createDrawerNavigator, DrawerItem,DrawerContentScrollView,DrawerItemList } from '@react-navigation/drawer';
import { useNavigation} from '@react-navigation/native';
import React, { useState,useCallback, memo, Suspense, useEffect} from 'react';
import { TouchableWithoutFeedback,useColorScheme,View, } from 'react-native';
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from '../authContext.tsx';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Icon,useTheme,Text} from 'react-native-paper';
import LazyScreenComponent from '../components/LazyScreenComponent.tsx';
import TabNavigation from '../navigation/TabNavigation.tsx';
import SplashScreen from '../screen/SplashScreen.tsx';
const SecondStackNavigation = React.lazy(() => import('../navigation/SecondStackNavigation.tsx'));
const SettingsScreen = React.lazy(() => import('../screen/SettingsScreen.tsx'));
const Drawer = createDrawerNavigator();


const SettingsScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <SettingsScreen/>
    </LazyScreenComponent>
  )
})
const SecondStackNavigationWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <SecondStackNavigation/>
    </LazyScreenComponent>
  )
})



const DrawerNavigation = () => {
  const theme = useTheme()
  const {user,logout,loading} = useAuth()
  const [isloading,setLoading] = useState<boolean>(true)
  const navigation = useNavigation()


  const handleLogout = useCallback(async () => {
    setLoading(true)
    try{
      await logout();
      navigation.navigate('Login' as never)
    }catch(error){
      console.error(` Error failed: ${error}`)
    }finally{
      setLoading(false);
    }

  },[])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000);
    return () => clearTimeout(timer)
  },[])




  if(isloading){
    return (
      <SplashScreen/>
    )
  }

  return (

    <Drawer.Navigator
    initialRouteName='Home'
    drawerContent={props => (
      <DrawerContentScrollView {...props}>
          <View style={{ padding: 10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
           <TouchableWithoutFeedback  onPress={() => props.navigation.navigate('Home',{screen:'Account'})}>
            {
              user.profileUrl ? 
              <Image
              style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
              source={{uri:user?.profileUrl}}
              placeholder={{blurhash}}
              /> :   <Image
              style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
              source={require('../assets/user.png')}
              placeholder={{blurhash}}
              />
            }
            </TouchableWithoutFeedback> 
            <Text>{user?.username}</Text>
          </View>
          <DrawerItemList {...props}/>
          <DrawerItem
          label="Logout"
          labelStyle={{
            color:theme.colors.tertiary,
            fontSize:24
          }}
          icon={ () => (<Icon
            source="logout"
            color={theme.colors.tertiary}
            size={20}/>)}
            onPress={handleLogout}
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
      component={TabNavigation}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="home"
          color={theme.colors.tertiary}
          size={size}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary,
          fontSize:24
        },
        headerShown:false,
      }}/>
    <Drawer.Screen
      name='Settings'
      component={SettingsScreenWrapper}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="cog-outline"
          color={theme.colors.tertiary}
          size={size}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary,
          fontSize:24
        },
        headerShown:false,
      }}/>
  <Drawer.Screen
      name='News'
      component={SecondStackNavigationWrapper}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="cog-outline"
          color={theme.colors.tertiary}
          size={size}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary,
          fontSize:24
        },
        headerShown:false,
      }}/>
    </Drawer.Navigator>

  )
}

export default DrawerNavigation
