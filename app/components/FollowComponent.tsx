import {View,} from 'react-native'
import { Text,useTheme } from 'react-native-paper'

interface Follow{
  content?:string,
  count?:string | number 
}
const FollowComponent:React.FC<Follow> = ({content,count}) => {
  const theme = useTheme()
  return (
    <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                  <View style={{flexDirection:'column',alignItems:'center'}}>
                  <Text variant='bodyMedium' style={{color:'#fff'}}>{count}</Text>
                  <Text variant='bodyMedium'style={{color:'#fff'}}>{content}</Text>
                  </View>
                  </View>
  )
}

export default FollowComponent