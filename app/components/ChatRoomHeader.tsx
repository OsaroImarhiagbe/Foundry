import React,{useState} from 'react'
import { 
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,} from 'react-native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import color from '../../config/color';
import { Image } from 'expo-image';
import { useAuth } from '../authContext';
import { blurhash} from '../../utils/index'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import {
    Menu,
    MenuOptions,
    MenuTrigger,
  } from 'react-native-popup-menu';
import { useTheme } from 'react-native-paper';
import { MenuItems } from './CustomMenu';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector} from 'react-redux';
import { Appbar,ActivityIndicator,Text } from 'react-native-paper';


interface HeaderProp{
  title?:string,
  onPress?:() => void,
  icon?:string,
  onPress2?:() => void,
  backgroundColor?:string,
  icon2?:string,
  iconColor?:string,
  opacity?:string,
  backColor?:string,
  icon3?:string

}
  
const ChatRoomHeader:React.FC<HeaderProp> = ({title,onPress,icon,onPress2,backgroundColor,icon2,iconColor,opacity,backColor,icon3}) => {

    

    const ios = Platform.OS == 'ios'
    const { top } = useSafeAreaInsets(); 
    const { user,logout } = useAuth();
    const [isLoading, setLoading] = useState(false)
    const theme = useTheme()
    const navigation = useNavigation();
    const profileImage = useSelector((state:any) => state.user.profileimg)

    const Divider = () => {
        return (
            <View style={{width:'100%',padding:1,borderBottomWidth:2, borderColor:color.grey}}/>
        )
    }
    const handleLogout = async () => {
      setLoading(true)
      try{
        await logout();
        setTimeout(() => {
          navigation.navigate('Login' as never)
          Alert.alert('Success!','you have logged out!!')
        }, 2000);
      }catch(error){
        console.error(` Error failed: ${error}`)
      }finally{
        setLoading(false);
      }
  
    }
    return (
    <Appbar.Header
    mode='center-aligned'
    style={[styles.container,{backgroundColor:backgroundColor,opacity:0.5}]}>
         <TouchableOpacity onPress={onPress}>
          <View style={styles.icon}>
          { icon && <MaterialCommunityIcons name={icon} color={theme.colors.primary} size={20} />}
          </View>
        </TouchableOpacity>
        <Text>{title}</Text>
        <TouchableOpacity
         onPress={() => navigation.navigate('Post' as never)}>
        <View style={styles.icon}>
          {icon2 && <Entypo name={icon2} size={20} color={theme.colors.primary}/>}
        </View>
        </TouchableOpacity>
        <TouchableOpacity
         onPress={() => navigation.navigate('Post' as never)}>
        <View style={styles.icon}>
          {icon3 && <Entypo name={icon3} size={20} color={theme.colors.primary}/>}
        </View>
        </TouchableOpacity>
    </Appbar.Header>
  )
}

const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        paddingLeft:10,
        paddingRight:10,
        overflow:'hidden',
        zIndex:10,

    },
    text:{
        color:'#fff',
        fontFamily:'Helvetica-light',
        textAlign:'center',
        fontSize:30,
        padding:20,
        
    },
    icon:{
      margin:5
    },
})

export default ChatRoomHeader
