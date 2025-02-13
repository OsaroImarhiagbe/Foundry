import React,{useState} from 'react'
import { 
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
  } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import { Appbar,Text } from 'react-native-paper';


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
    const theme = useTheme()


    return (
    <Appbar.Header
    mode='center-aligned'
    style={[styles.container,{backgroundColor:backgroundColor,opacity:0.5}]}>
         <TouchableOpacity onPress={onPress}>
          <View style={styles.icon}>
          { icon && <MaterialCommunityIcons name={icon} color={theme.colors.primary} size={20} />}
          </View>
        </TouchableOpacity>
        <View style={{alignItems:'center',justifyContent:'center'}}>
        <Text
        variant='titleMedium'
        style={{
          color:'#000',
          textAlign:'center',
          paddingLeft:50
        }}>{title}</Text>
        </View>
         <TouchableOpacity
         onPress={() => console.log('camera')}>
        <View style={styles.icon}>
          {icon2 && <Entypo name={icon2} size={20} color={theme.colors.primary}/>}
        </View>
        </TouchableOpacity>
        <TouchableOpacity
         onPress={() => console.log('phone')}>
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
    icon:{
      margin:5
    },
})

export default ChatRoomHeader
