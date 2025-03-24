import { View, Text, StyleSheet, TouchableHighlight,TouchableOpacity} from 'react-native'
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../authContext';
import { blurhash } from '../../utils/index';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { getRoomID,} from '../../utils';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useDispatch} from 'react-redux';
import {removeID} from '../features/Message/messageidSlice';
import { getDatabase, onValue } from '@react-native-firebase/database';

interface ChatRoomProp{
  next_item?:any,
  onPress?:()=>void,
  User?:any
}

interface Message {
  userId?: string;
  content?: string;
  createdAt?: Date,
  senderId?:string
}

const ChatRoom:React.FC<ChatRoomProp> = ({next_item, onPress,User}) => {

  
 

    const {user } = useAuth();
    const dispatch = useDispatch()
    const [lastMessage, setLastMessage] = useState<Message | null>(null);
    const [time,setTime] = useState('')
    useEffect(() => {
        const roomId = getRoomID(User?.userId,next_item?.userId)
        const chatsRef = getDatabase().ref(`/chats/${roomId}/lastMessage`);
        const unsub = onValue(chatsRef,(snapshot) => {
          if(snapshot.exists()){
            const Message = snapshot.val()
            setLastMessage(Message.content || null)
            setTime(Message.createdAt)
          }else{
            setLastMessage(null)
          }
      })
        return () => unsub()

      },[User?.userId, next_item?.userId])

      const renderLastMessage = useCallback(() => {
        if(typeof lastMessage == 'undefined') return 'Loading...'
        if(lastMessage){
            if(User.userId == lastMessage.senderId){
                return 'You: '+ lastMessage?.content
            }
            return lastMessage?.content;
        }else{
            return 'Say Hi'
        }
      },[lastMessage])

      const handleDelete = useCallback(async () => {
        try {
          const roomId = getRoomID(User?.userId,next_item?.userId)
          const messagesRef = getDatabase().ref(`/messages/${roomId}`);
          await messagesRef.remove();
          const chatsRef = getDatabase().ref(`/chats/${roomId}`)
          await chatsRef.remove()
          dispatch(removeID(next_item.userId))
        } catch (error) {
          console.error('Error deleting document: ', error);

        }
      },[User?.userId,next_item?.userId]);
      

      const renderRightActions = useCallback(() =>{
        return (
          <View style={{borderRadius:15,backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
              <TouchableOpacity onPress={handleDelete} >
            <Text style={{color: 'white',fontWeight: 'bold',}}>Delete</Text>
          </TouchableOpacity>
          </View>
        )
      },[handleDelete])
  return (
 
    <Swipeable renderRightActions={renderRightActions}>
       <TouchableHighlight
    underlayColor='#252525'
    onPress={onPress}>
        <View style={styles.container}>
          <View>
          <Image
              style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
              placeholder={{blurhash}}
              source={next_item?.profileUrl}
              transition={500}/>
          </View>
         <View style={styles.detailsContainer}>
             <Text numberOfLines={1} style={styles.title}>{next_item?.name}</Text>
             <Text  numberOfLines={2} style={styles.subTitle} >{renderLastMessage()}</Text>
         </View>
         <Text  numberOfLines={2} style={styles.subTitle} >{time}</Text>
        </View>
    </TouchableHighlight>
    </Swipeable>
   
  
  )
}

const styles = StyleSheet.create({
  container:{
      flexDirection:'row',
      padding: 15,
      alignItems:'center',
      backgroundColor:'#252525',
      borderRadius:15

  },
  detailsContainer:{
      flex:1,
      marginLeft:10,
      justifyContent:'center',
  },
  iconContainer:{
      borderRadius:50,
  },
  image:{
      width:50,
      height: 50,
      borderRadius: 50,
      marginRight:10
  },
  title:{
      fontWeight: 500,
      marginBottom:5,
      color:"#000"
      
  },
  subTitle:{
      color:'#6e6969'
  }
})

export default ChatRoom
