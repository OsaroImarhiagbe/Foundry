import React,
{
  Suspense,
  useCallback,
  useEffect,
}from 'react'
import {
    View,
    TouchableOpacity,
    } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {Image} from 'expo-image'
import { useAuth } from '../authContext';
import { blurhash } from '../../utils';
import { useTheme } from 'react-native-paper';
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
import { MenuItems } from '../components/CustomMenu';
import { addsearchID } from '../features/search/searchSlice';
import SearchComponent from '../components/SearchComponent';
import { functions } from '../../FirebaseConfig.ts';
import LazyScreenComponent from 'app/components/LazyScreenComponent.tsx';
import { httpsCallable } from '@react-native-firebase/functions'
import {  useSafeAreaInsets } from 'react-native-safe-area-context';
const HomeScreen = React.lazy(() => import('../screen/HomeScreen.tsx'));
const FeedScreen = React.lazy(() => import('../screen/FeedScreen.tsx'));
type NavigationProp = {
  openDrawer(): undefined;
  navigate(arg0?: string, arg1?: { screen: string; }): unknown;
  News:undefined,
  Home:undefined,
  Post:undefined
}
const Tab = createMaterialTopTabNavigator();


const HomeScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <HomeScreen/>
      </LazyScreenComponent>
  )
})
const FeedScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <FeedScreen/>
    </LazyScreenComponent>
  )
})



const DashBoardScreen = () => {
    const {user} = useAuth()
    const navigation = useNavigation<NavigationProp>()
    const theme = useTheme()
    const {top} = useSafeAreaInsets()
    const dispatch = useDispatch()

    const handleSearch = useCallback((id:string) => {
      dispatch(addsearchID(id))
    },[dispatch])
    
 

  

    const handleMessage = useCallback(() => {
      navigation.navigate('Message')
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
         onPress={handleMessage}>
        <View>
           <Entypo name='new-message' size={20} color={theme.colors.primary}/>
        </View>
        </TouchableOpacity>
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
          onPress={() => navigation.navigate('Post')}
        />
        </View>
    </View>
  )
}


export default DashBoardScreen
