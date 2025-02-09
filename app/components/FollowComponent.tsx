import {View,} from 'react-native'
import { Text,useTheme } from 'react-native-paper'

interface Follow{
  content?:string,
  count?:string | number 
}
const FollowComponent:React.FC<Follow> = ({content,count}) => {
  const theme = useTheme()
  return (
    <View>
                  <View style={{flexDirection:'row'}}>
                  <Text variant='bodySmall' style={{color:theme.colors.onTertiary}}>{count}</Text>
                  <Text variant='bodySmall'style={{color:theme.colors.onTertiary}}>{content}</Text>
                  </View>
                  </View>
  )
}

export default FollowComponent