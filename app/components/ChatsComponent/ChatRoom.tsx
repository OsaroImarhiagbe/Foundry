import { View, StyleSheet, TouchableHighlight,TouchableOpacity} from 'react-native'
import { useState, useEffect, useMemo, useCallback } from 'react';
import { blurhash, TimeAgo } from '../../utils/index';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useDispatch} from 'react-redux';
import {removeID} from '../features/Message/messageidSlice';
import { getDatabase, onValue } from '@react-native-firebase/database';
import { Text,useTheme } from 'react-native-paper';

interface ChatRoomProp{
  last_message:string,
  chat_room_id:string,
  username_1:string,
  user_1:string,
  username_2:string,
  date:string,
  onPress?:()=>void,
  user?:any
}



const ChatRoom:React.FC<ChatRoomProp> = ({onPress,user,last_message,chat_room_id,username_1,username_2,date,user_1}) => {
  const theme = useTheme()
  const renderLastMessage = useCallback(() => {
    if (typeof last_message === 'undefined') return 'Loading...';
    if (last_message) {
      if (user.userId === user_1) {
        return 'You: ' + last_message;
      }
      return last_message;
    } else {
      return 'Say Hi';
    }
  },[last_message]);
  const handleDelete = useCallback(async () => {
    try {
      const messagesRef = getDatabase().ref(`/messages/${chat_room_id}`);
      await messagesRef.remove();
      const chatsRef = getDatabase().ref(`/chats/${chat_room_id}`)
      await chatsRef.remove()
      }catch(error){
        console.error('Error deleting document: ', error);
      }
    },[chat_room_id]);
  const renderRightActions = useCallback(() =>{
    return (
    <TouchableOpacity onPress={handleDelete} style={{ justifyContent: 'center', alignItems: 'center',}}>
      <Text variant='bodyMedium' style={{color:theme.colors.tertiary}}>Delete</Text>
      </TouchableOpacity>
      )
    },[handleDelete])
  return (
 
    <Swipeable rightThreshold={200} renderRightActions={renderRightActions}>
      <TouchableHighlight
      onPress={onPress}>
        <View style={styles.container}>
          <View>
          <Image
              style={{height:hp(5.3), aspectRatio:1, borderRadius:100}}
              placeholder={{blurhash}}
              source={require('../assets/user.png')}
              transition={500}/>
          </View>
         <View style={styles.detailsContainer}>
             <Text variant='bodyMedium' numberOfLines={1} >{user.userId === user_1 ? username_2 : username_1}</Text>
             <Text variant='bodyLarge' numberOfLines={2} style={{color:theme.colors.onTertiary}}>{renderLastMessage()}</Text>
         </View>
         <Text variant='bodySmall' numberOfLines={2}>{date}</Text>
        </View>
    </TouchableHighlight>
    </Swipeable>
   
  
  )
}

const styles = StyleSheet.create({
  container:{
      flexDirection:'row',
      alignItems:'center',
  },
  detailsContainer:{
      flex:1,
      marginLeft:10,
      justifyContent:'center',
  },
  iconContainer:{
      borderRadius:50,
  },
})

export default ChatRoom
