import React,
{
  useState,
  lazy,
  Suspense
}from 'react'
import {
    View,
    StyleSheet,
    TouchableOpacity} from 'react-native'
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
import { MenuItems } from '../components/CustomMenu'


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





const DashBoardScreen = () => {
    const {user} = useAuth()
    const navigation = useNavigation<NavigationProp>()
    const theme = useTheme()
    const [category,setCategory] = useState<string>('')



  return (
    <View style={{flex:1,paddingTop:hp(5),backgroundColor:theme.colors.background}}> 
        <View style={{
          alignItems:'center',
          paddingTop:20,
          flexDirection:'row',
          justifyContent:'space-between',
          padding:10,
          backgroundColor:'transparent'}}>
        <TouchableWithoutFeedback onPress={() => navigation.openDrawer()}>
        <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source={user?.profileUrl}
        placeholder={{blurhash}}
        cachePolicy='none'/>
        </TouchableWithoutFeedback >
        <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        />
       <TouchableOpacity
         onPress={() => navigation.navigate('Message')}>
        <View style={styles.icon}>
           <Entypo name='new-message' size={20} color={theme.colors.primary}/>
        </View>
        </TouchableOpacity>
        <Menu>
      <MenuTrigger>
      <View style={{flexDirection:'row',alignItems:'center'}}>
        <Icon
         source='menu-down'
         size={25}/>
      </View>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
            optionsContainer:{
                borderRadius:10,
                marginTop:40,
                marginLeft:-30,
                borderCurve:'continuous',
                backgroundColor:'#fff',
                position:'relative'
            }
        }}
      >
        <MenuItems 
        text='Anyone'
        action={()=>setCategory('Anyone')}/>
        <Divider/>
         <MenuItems 
        text='Creativity and Innovation'
        action={()=>setCategory('Creativity and Innovation')}/>
      <Divider/>
      <MenuItems 
        text='Collaboration and Community'
        action={()=>setCategory('Collaboration and Community')}/>
      <Divider/>
      <MenuItems 
        text='Startup and Busniess'
        action={()=>setCategory('Statup and Busniess')}/>
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
        component={FeedScreen}
        />
        <Tab.Screen
        name='Community'
        component={HomeScreen}
        initialParams={{category:category}}
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

const styles = StyleSheet.create({
    logo: {
      width: 40,
      height: 40, 
    },
    icon:{
      margin:5
    },
    container:{
      flex:1
    }
});

export default DashBoardScreen