import React,
{
  useCallback,
  lazy,
}from 'react'
import {
    View,
    TouchableOpacity,
    useColorScheme} from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {Image} from 'expo-image'
import { useAuth } from '../authContext';
import { blurhash } from '../../utils';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { FAB } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import { Icon,Divider} from 'react-native-paper';
import {
  Menu,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { useDispatch} from 'react-redux';
import { MenuItems } from '../components/CustomMenu'
import { addsearchID } from 'app/features/search/searchSlice';
import SearchComponent from 'app/components/SearchComponent';
import { httpsCallable } from '@react-native-firebase/functions'
import { functions } from 'FirebaseConfig';
import LazyScreenComponent from 'app/components/LazyScreenComponent';


type NavigationProp = {
  openDrawer(): undefined;
  navigate(arg0?: string, arg1?: { screen: string; }): unknown;
  SecondStack:undefined,
  Home:undefined,
  Post:undefined
}
const Tab = createMaterialTopTabNavigator();
const FeedScreen = lazy(() => import('../screen/FeedScreen'))
const HomeScreen = lazy(() => import('../screen/HomeScreen'))

const HomeScreenWrapper = () => {
  return (
    <LazyScreenComponent>
      <HomeScreen/>
    </LazyScreenComponent>

  )
}
const FeedScreenWrapper = () => {
  return (
    <LazyScreenComponent>
      <FeedScreen/>
    </LazyScreenComponent>
  )}

console.log('DashBoardScreen rendered')

const DashBoardScreen = () => {
    const {user} = useAuth()
    const navigation = useNavigation<NavigationProp>()
    const theme = useTheme()
    const dispatch = useDispatch()
    const dark_or_light = useColorScheme()

    const handleSearch = useCallback((id:string) => {
      dispatch(addsearchID(id))
    },[dispatch])
    
 

    const testSend = useCallback(() => {
      const addTest = httpsCallable(functions,'sendTestNotification')
      addTest({text:'Hello'}).then((result) => {
        console.log(result.data)
      })
    },[])


  return (
    <View style={{flex:1,paddingTop:hp(5),backgroundColor:theme.colors.background}}> 
        <View style={{
          alignItems:'center',
          paddingTop:20,
          flexDirection:'row',
          padding:10,
          justifyContent:'space-between',
          backgroundColor:theme.colors.background}}>
        <TouchableWithoutFeedback onPress={() => navigation.openDrawer()}>
          {user.profile ?   <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source={user?.profileUrl}
        placeholder={{blurhash}}
        cachePolicy='memory'/> :   <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source={require('../assets/user.png')}
        placeholder={{blurhash}}
        cachePolicy='memory'/> }
        </TouchableWithoutFeedback >
        <SearchComponent
        title='Search....'
        />
       <TouchableOpacity
         onPress={() => navigation.navigate('Message')}>
        <View>
           <Entypo name='new-message' size={20} color={theme.colors.primary}/>
        </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
         onPress={testSend}>
        <View>
           <Entypo name='note' size={20} color={theme.colors.primary}/>
        </View>
        </TouchableOpacity> */}
        <Menu>
      <MenuTrigger>
        <Icon
         source='dots-horizontal'
         size={25}/>
      </MenuTrigger>
      <MenuOptions
    customStyles={{
          optionsContainer:{
              borderRadius:10,
              marginTop:40,
              marginLeft:-30,
              borderCurve:'continuous',
              backgroundColor:'#fff',
          }
      }}
    >
      <MenuItems 
      text='Anyone'
      action={()=> handleSearch('Anyone')}/>
      <Divider/>
       <MenuItems 
      text='Creativity and Innovation'
      action={()=> handleSearch('Creativity and Innovation')}/>
    <Divider/>
    <MenuItems 
      text='Collaboration and Community'
      action={()=> handleSearch('Collaboration and Community')}/>
    <Divider/>
    <MenuItems 
      text='Startup and Busniess'
      action={()=> handleSearch('Statup and Busniess')}/>
    </MenuOptions>
    </Menu>
        </View>
        <View style={{flex:1}}>
        <Tab.Navigator
        screenOptions={{
            swipeEnabled:true,
            tabBarIndicatorStyle:{
            backgroundColor:theme.colors.primary,
            },
            tabBarStyle:{
            backgroundColor:'transparent',
            },
          tabBarActiveTintColor:theme.colors.tertiary,
          tabBarLabelStyle:{
            color:theme.colors.tertiary
          }
    }}
    >
        <Tab.Screen
        name='For You'
        component={FeedScreenWrapper}
        />
        <Tab.Screen
        name='Community'
        component={HomeScreenWrapper}
        />
        </Tab.Navigator>
        <FAB
          icon="plus"
          variant='primary'
          size='medium'
          mode='elevated'
          color={theme.colors.primary}
          style={{position:'absolute',right:16,top:hp(65),alignItems:'center'}}
          onPress={() => navigation.navigate('SecondStack',{screen:'Post'})}
        />
        </View>
    </View>
  )
}


export default DashBoardScreen
