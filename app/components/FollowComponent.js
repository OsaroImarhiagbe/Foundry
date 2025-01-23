import {View,} from 'react-native'
import { Text } from 'react-native-paper'

const FollowComponent = ({content,count}) => {
  return (
    <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                  <View style={{flexDirection:'column',alignItems:'center'}}>
                  <Text variant='bodyMedium' style={{color:'#fff'}}>{count}</Text>
                  <Text variant='bodyMedium'style={{color:'#fff'}}>{content}</Text>
                  <View style={{marginTop:5,borderWidth:1,borderColor:'#000',width:50,borderColor:'#00BF63'}}></View>
                  </View>
                  </View>
  )
}

export default FollowComponent