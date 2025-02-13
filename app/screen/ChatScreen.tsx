
import {
  View,
  StyleSheet,
  SafeAreaView}  from 'react-native'
import color from'../../config/color';
import React, { useState, useEffect, useRef} from 'react'
import MessageList  from '../components/MessageList';
import { getRoomID } from '../../utils';
import { useAuth } from '../authContext';
import { useRoute,RouteProp } from '@react-navigation/native';
import CustomKeyboardView from '../components/CustomKeyboardView';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addID } from '../features/Message/messageidSlice';
import firestore,{FirebaseFirestoreTypes} from '@react-native-firebase/firestore'
import MessageItem from '../components/MessageItem';
import { FlashList } from '@shopify/flash-list';
import { TextInput } from 'react-native-paper';


type ChatScreenRouteProp = RouteProp<{ Chat: { item: any,userid:string,name:string } }, 'Chat'>;

const ChatScreen = () => {
  const [messages, setMessages] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
  const [expoPushToken,setExpoPushToken] = useState('')
  const route = useRoute<ChatScreenRouteProp>();
  const {item,userid,name} = route?.params;
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch()
  const inputRef = useRef<React.ComponentProps<typeof TextInput>>(null);
  const flashListRef = useRef<FlashList<any> | null>(null);

  
  const recipentNamec = userid ? name  : item?.userId ? item.name : 'Unknown Recipient';
  useEffect(() => {
    const loadMessages = (roomId:string) => {
      const docRef = firestore().collection('chat-rooms').doc(roomId);
      const messageRef = docRef.collection('messages').orderBy('createdAt', 'asc')
      let unsub = messageRef.onSnapshot((documentSnapshot) => {
        let allMessages = documentSnapshot.docs.map((doc) => doc.data());
        setMessages(allMessages);
      });
      return unsub;
    };
  
    const roomId = userid ? getRoomID(user?.userId, userid) : item?.userId ? getRoomID(user?.userId, item.userId) : null;
  
    if (roomId) {
      createRoom();
      dispatch(addID(userid));
      const unsubscribe = loadMessages(roomId);
      return () => unsubscribe();
    }
  
  }, [userid, item?.userId]);
  
  useEffect(() => {
    const getToken = async () => {
      try{
      const id = route?.params?.userid ? route?.params?.userid : item?.userId
      const docRef = firestore().collection('users').doc(id)
      const snapShot = await docRef.get()
        if(snapShot.exists){
          const data = snapShot.data()
          if(data) setExpoPushToken(data.expoToken)
        }else{
          console.error('No such document')
        }
      }catch(err:any){
        console.error('Error with grabbing token:',err)

      }
    }

    getToken()
    
  },[route?.params?.userid, item?.userId])

  const createRoom = async () => {
    try{
      
      const roomId = userid ? getRoomID(user?.userId, userid) : item?.userId ? getRoomID(user?.userId, item?.userId) : undefined
      const id = userid ? userid : item?.userId
      await firestore().collection('chat-rooms').doc(roomId).set({
        roomId:roomId,
        createdAt: firestore.Timestamp.fromDate(new Date()),
        recipientId:[id],
        recipentName:recipentNamec,
        senderName:user?.username,
        senderId:user?.userId,
      })
    } catch (error:unknown) {
      console.error("Error creating room:", error);
    }
  };

  const handleSend = async () => {
    const id = userid ? userid : item?.userId
    if(!messageText.trim()) return;
    try{
      const roomId = userid
      ? getRoomID(user?.userId, userid)
      : item?.userId
      ? getRoomID(user?.userId, item.userId)
      : undefined;
      const docRef = firestore().collection('chat-rooms').doc(roomId);
      const messageRef = docRef.collection('messages')
      await messageRef.add({
        senderId:user?.userId,
        recipentId:id,
        id:messageRef.doc().id,
        text:messageText,
        senderName: user?.username,
        recipentName:recipentNamec,
        createdAt: firestore.Timestamp.fromDate(new Date())
      })
      if (flashListRef.current) {
        flashListRef.current.scrollToEnd({ animated: true });
      }
      setMessageText('');
    }catch(error:unknown){
      console.error(`Error sending message:${error}`)
    }
  }

  return (
    <CustomKeyboardView
    inChat={true}
    >
      <View style={{flex:1}}>
      <ChatRoomHeader 
      title={recipentNamec}
      backgroundColor='transparent'
      icon='keyboard-backspace'
      iconColor='#00bf63'
      icon2='camera'
      icon3='phone'
      onPress={() => navigation.goBack()}/>
      <View style={styles.messagesContainer}>
        <FlashList
         ref={flashListRef} 
        data={messages}
        keyExtractor={item => item?.id.toString()}
        estimatedItemSize={360}
        renderItem={({item}) => (
          <MessageItem  date={item.createdAt.toDate().toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })} id={item.userId} message_text={item.text} current_User={user}/>
        )}
        />
      </View>
      <View>
      <View style={styles.inputContainer}>
        <View style={styles.messageInput}>
           <TextInput
          left={<TextInput.Icon 
            icon='camera'
            size={25} 
            style={[styles.sendButton,{alignSelf:'center',paddingBottom:5}]} 
            rippleColor='rgba(30, 136, 229, 0.3)'/>}
          dense={true}
          mode='outlined'
          outlineStyle={{borderRadius:100}}
          textColor='#000'
          placeholderTextColor='#000'
          style={[styles.textinput,{fontSize:16,backgroundColor:'transparent'}]}
          onChangeText={setMessageText}
          placeholder='Message....'
          right={<TextInput.Icon 
            icon='send'
            size={25}
            style={[styles.sendButton,{alignSelf:'center',paddingBottom:5}]} 
            onPress={handleSend} 
            rippleColor='rgba(30, 136, 229, 0.3)'/>
          }
          /> 
           </View>
        </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding:2
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems:'flex-end',
  },
  messageInput: {
    flexDirection:'row',
    padding:20,
  },
  textinput:{
    flexDirection:'row',
    marginRight:2,
    height:35,
  },
  sendButton: {
    marginRight:1,
    paddingTop:10,
    justifyContent:'center'
  },
});

export default ChatScreen
