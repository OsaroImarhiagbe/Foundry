import React from 'react'
import {View} from 'react-native'
import ChatRoom from '../app/components/ChatRoom'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TimeAgo } from '../utils/index';

type NavigationProp = {
  Chat:{item:string | undefined}
}

type Navigation = NativeStackNavigationProp<NavigationProp>
interface List{
  otherusers:any[],
  currentUser:any
}
const ChatList:React.FC<List> = ({otherusers,currentUser}) => {
    const navigation = useNavigation<Navigation>();

  return (
   <View>
    {Array.isArray(otherusers) && otherusers.map((item:any) =>(
      <View style={{padding:10}} key={item.id}>
          <ChatRoom
          user={currentUser}
          username_1={item.participants.username_1}
          username_2={item.participants.username_2}
          user_1={item.participants.user_1}
          date={TimeAgo(item.lastMessage.createdAt)}
          last_message={item.lastMessage.content}
          chat_room_id={item.id}
          onPress={() => navigation.navigate('Chat',{item})}
          />
      </View>          
    ))}
   </View>
  )
}
export default ChatList
