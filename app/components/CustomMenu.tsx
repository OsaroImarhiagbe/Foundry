import {
    MenuOption,
  } from 'react-native-popup-menu';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { View,StyleSheet } from 'react-native'
import { Text } from 'react-native-paper';
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
                <Text
                variant='bodySmall'>{text}</Text>
                <Text
                variant='bodySmall'
                >{icon}</Text>
            </View>
          </MenuOption>
       
      
      
     
    )
}
