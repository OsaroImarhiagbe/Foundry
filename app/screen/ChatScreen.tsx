import {
  useCallback
} from 'react'
import {
  View,
  StyleSheet,
  }  from 'react-native'
import React, { useState, useEffect, useRef} from 'react'
import { getRoomID } from '../../utils';
import { useAuth } from '../authContext';
import { useRoute,RouteProp } from '@react-navigation/native';
import CustomKeyboardView from '../components/CustomKeyboardView';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addID } from '../features/Message/messageidSlice';
import {
  collection,
  FirebaseFirestoreTypes,
  Timestamp,
  onSnapshot,
  doc,
  orderBy,
  query,
  setDoc
} from '@react-native-firebase/firestore'
import MessageItem from '../components/MessageItem';
import { FlashList } from '@shopify/flash-list';
import { TextInput,useTheme } from 'react-native-paper';
//import crashlytics, { crash } from '@react-native-firebase/crashlytics'
import { db,functions } from 'FIrebaseConfig';
import { httpsCallable } from '@react-native-firebase/functions'
type ChatScreenRouteProp = RouteProp<{ Chat: { item: any,userid:string,name:string } }, 'Chat'>;

const ChatScreen = () => {
  const [messages, setMessages] = useState<FirebaseFirestoreTypes.DocumentData[]>([]);
  const route = useRoute<ChatScreenRouteProp>();
  const {item,userid,name} = route?.params;
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch()
  const flashListRef = useRef<FlashList<any> | null>(null);
  const theme = useTheme()
  const inputRef = useRef<any>(null)
  const roomId = userid ? getRoomID(user?.userId, userid) : item?.userId ? getRoomID(user?.userId, item.userId) : null;
  const id = userid ? userid : item?.userId
  
  const recipientNamec = userid ? name  : item?.userId ? item.name : 'Unknown Recipient';
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    //crashlytics().log('Chat Screen: Grabbing messages')
    const loadMessages = (roomId:string) => {
      const docRef = doc(db,"chat-rooms",roomId);
      const messageRef = collection(docRef,'messages')
      const q = query(messageRef ,orderBy('createdAt', 'asc'))
      let unsub = onSnapshot(q,(documentSnapshot) => {
        let allMessages = documentSnapshot.docs.map((doc) => doc.data());
        setMessages(allMessages);
      });
      return unsub;
    };
    if (roomId && id) {
      createRoom(roomId,id);
      dispatch(addID(userid));
      const unsubscribe = loadMessages(roomId);
      return () => unsubscribe();
    }
  
  }, [userid, item?.userId]);

  const createRoom = useCallback(async (roomId:string,id:string) => {
    //crashlytics().log('Chat Screen: Creating Chat Room')
    try{
      await setDoc(doc(db,'chat-rooms',roomId), {
        roomId:roomId,
        createdAt: Timestamp.fromDate(new Date()),
        recipientId:[id],
        recipentName:recipientNamec,
        senderName:user?.username,
        senderId:user?.userId,
      })
    } catch (error:any) {
      //crashlytics().recordError(error)
      console.error("Error creating room:", error.message);
    }
  },[roomId,id]);

  const handleSend = async () => {
    //crashlytics().log('Chat Screen: Sening Messages ')
    if(messageText.trim() === '') return;
    try{
      const addMessage = httpsCallable(functions,'addMessage')
      const id = userid ? userid : item?.userId
      const roomId = userid
      ? getRoomID(user?.userId, userid)
      : item?.userId
      ? getRoomID(user?.userId, item.userId)
      : '';
      addMessage({
        senderId: user?.userId,
        recipientId: [id],
        roomId: roomId,
        senderName: user?.username,
        recipientName: recipientNamec,
        text: messageText,
      }).then((results) => {
        console.log(results)
      }).catch((error) => {
        console.log('Chat Screen Error: ',error.message)
      })
      //const docRef = doc(db,'chat-rooms',roomId);
      //const messageRef = collection(docRef,'messages')
      // await addDoc(messageRef, {
      //   senderId:user?.userId,
      //   recipentId:id,
      //   id:messageRef.doc().id,
      //   text:messageText,
      //   senderName: user?.username,
      //   recipentName:recipentNamec,
      //   createdAt: Timestamp.fromDate(new Date())
      // })
      setMessageText('');
      inputRef.current?.focus();
      if (flashListRef.current) {
        flashListRef.current.scrollToEnd({ animated: true });
      }
    }catch(error:any){
      //crashlytics().recordError(error)
      console.error(`Error sending message:${error.message}`)
    }
  }

  return (
    <CustomKeyboardView
    inChat={true}
    >
      <View style={{flex:1}}>
      <ChatRoomHeader 
      title={recipientNamec}
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
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
        estimatedItemSize={360}
        renderItem={({item}) => (
          <MessageItem  date={item.createdAt.toDate().toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })} id={item.recipentId} message_text={item.text} current_User={user}/>
        )}
        />
      </View>
      <View>
      <View style={styles.inputContainer}>
        <View style={styles.messageInput}>
           <TextInput
           ref={inputRef}
          left={<TextInput.Icon 
            icon='camera'
            size={25} 
            style={[styles.sendButton,{alignSelf:'center',paddingBottom:5}]} 
            rippleColor='rgba(30, 136, 229, 0.3)'/>}
          dense={true}
          mode='outlined'
          multiline={true}
          value={messageText}
          outlineStyle={{borderRadius:100}}
          textColor={theme.colors.tertiary}
          placeholderTextColor='#000'
          style={[styles.textinput,{fontSize:16,backgroundColor:'transparent'}]}
          onChangeText={setMessageText}
          placeholder='Message....'
          right={<TextInput.Icon 
            icon='send'
            size={25}
            style={[styles.sendButton,{alignSelf:'center',paddingBottom:5}]} 
            onPress={(e) => {
              e.preventDefault()
              handleSend()}} 
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
    padding:10,
    bottom:0
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
