import React from 'react'
import {View} from 'react-native'
import ChatRoom from '../app/components/ChatRoom'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = {
  Chat:{item:any}
}

type Navigation = NativeStackNavigationProp<NavigationProp>
interface List{
  otherusers:any,
  currentUser:any
}
const ChatList:React.FC<List> = ({otherusers,currentUser}) => {
    const navigation = useNavigation<Navigation>();

  return (
   <View>
    {otherusers.map((item:any) =>(
      <View style={{padding:10}} key={Math.random()}>
          <ChatRoom
                    
                    User={currentUser}
                    onPress={() => navigation.navigate('Chat',{item})}
                    next_item={item}
                   />
      </View>          
    ))}
   </View>
  )
}
export default ChatList
