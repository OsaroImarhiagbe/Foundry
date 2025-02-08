import {
    MenuOption,
  } from 'react-native-popup-menu';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { View,Text,StyleSheet } from 'react-native'
import color from '../../config/color';

interface Menu {
  text?:string,
  action?:() => void,
  value?:string,
  icon?:any
}
export const MenuItems:React.FC<Menu> = ({text, action,icon}) => {
    return (
       
        
          <MenuOption onSelect={action}>
            <View style={{paddingLeft:4,paddingRight:4,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={styles.text}>{text}</Text>
                <Text>{icon}</Text>
            </View>
          </MenuOption>
       
      
      
     
    )
}

const styles = StyleSheet.create({
  text:{
    fontWeight:'400',
    fontFamily:color.textFont
  }
})
