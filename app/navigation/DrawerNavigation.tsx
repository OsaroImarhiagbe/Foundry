import { createDrawerNavigator, DrawerItem,DrawerContentScrollView,DrawerItemList } from '@react-navigation/drawer';
import { useNavigation} from '@react-navigation/native';
import { lazy,Suspense, useState, useMemo, useCallback, memo} from 'react';
import { ActivityIndicator,TouchableWithoutFeedback,useColorScheme,View, } from 'react-native';
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Icon,useTheme,Text} from 'react-native-paper';
import LazyScreenComponent from 'app/components/LazyScreenComponent';



const Drawer = createDrawerNavigator();
const TabNavigation = lazy(() => import('./TabNavigation'))
const SettingsScreen = lazy(() => import('../screen/SettingsScreen'))


const TabNavigationWrapper = memo(() => (
  <LazyScreenComponent>
    <TabNavigation/>
  </LazyScreenComponent>
));

const SettingScreenWrapper = memo(() => (
  <LazyScreenComponent>
    <SettingsScreen/>
  </LazyScreenComponent>
));



const DrawerNavigation = () => {
  const theme = useTheme()
  const {user,logout} = useAuth()
  const [loading,setLoading] = useState<boolean>(false)
  const navigation = useNavigation()
  const dark_or_light = useColorScheme()

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
          <DrawerItemList {...props} />
          <DrawerItem
              label="Logout"
              labelStyle={{
                color:theme.colors.tertiary
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
      component={TabNavigationWrapper}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="home"
          color={theme.colors.tertiary}
          size={size}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary
        },
        headerShown:false,
      }}/>
       <Drawer.Screen
      name='News'
      component={SettingScreenWrapper}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="source-branch"
          color={theme.colors.tertiary}
          size={size}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary,
        },
        headerShown:false,
      }}/>
       <Drawer.Screen
      name='Settings'
      component={SettingScreenWrapper}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="cog-outline"
          color={theme.colors.tertiary}
          size={size}/>
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
