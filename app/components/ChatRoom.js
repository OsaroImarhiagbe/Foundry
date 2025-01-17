import { View, Text, StyleSheet, TouchableHighlight,TouchableOpacity} from 'react-native'
import { useState, useEffect } from 'react';
import { useAuth } from '../authContext';
import { blurhash } from '../../utils/index';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import firestore from '@react-native-firebase/firestore';
import { getRoomID,formatDate } from '../../utils';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useDispatch} from 'react-redux';
import {removeID} from '../features/Message/messageidSlice';

const ChatRoom = ({next_item, onPress,User}) => {

  
 

    const {user } = useAuth();
    const dispatch = useDispatch()


  
 
    const [lastMessage, setLastMessage] = useState(undefined);
    useEffect(() => {
        const roomId = getRoomID(User?.userId,next_item?.userId)
        const docRef = firestore().collection('rooms').doc(roomId);
        const messageRef = docRef.collection('messages').orderBy('createdAt','desc')
        const unsub = messageRef.onSnapshot((documentSnapshot) => {
          let allmessage = documentSnapshot.docs.map(doc => {
            return doc.data()
          });
          setLastMessage(allmessage[0] ? allmessage[0]: null)
      })
        return () => unsub()

      },[User?.userId, next_item?.userId])

      const renderTime = () => {
        if(lastMessage){
            let date = lastMessage?.createdAt
            return formatDate(new Date(date?.seconds * 1000))
        }
      }
      const renderLastMessage =() => {
        if(typeof lastMessage == 'undefined') return 'Loading...'
        if(lastMessage){
            if(User.userId == lastMessage.userId){
                return 'You: '+ lastMessage?.text
            }
            return lastMessage?.text;
        }else{
            return 'Say Hi'
        }
      }

      const handleDelete = async () => {
        try {
          const roomId = getRoomID(User?.userId,next_item?.userId)
          const messagesRef = firestore().collection('rooms').doc(roomId).collection('messages')
          const messagesSnapshot = await messagesRef.get();
          const docPromise = messagesSnapshot.docs.map((messageDoc) => {
               return messageDoc.ref.delete();
            });
          await Promise.all(docPromise)

          const roomRef = firestore().collection('rooms').doc(roomId)
          const sent_message = firestore().collection('sent-message-id').doc(next_item.userId)
          await roomRef.delete()
          await sent_message.delete()
          dispatch(removeID(next_item.userId))
        } catch (error) {
          console.error('Error deleting document: ', error);

        }
      };
      

      const renderRightActions = (progress,dragX) =>{
        return (
          <View style={{borderRadius:15,backgroundColor: '#252525', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
              <TouchableOpacity onPress={handleDelete} >
            <Text style={{color: 'white',fontWeight: 'bold',}}>Delete</Text>
          </TouchableOpacity>
          </View>
        
          
        )
      }
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
         <Text  numberOfLines={2} style={styles.subTitle} >{renderTime()}</Text>
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
