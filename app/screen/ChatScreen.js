
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView}  from 'react-native'
import color from'../../config/color';
import React, { useState, useEffect, useRef} from 'react'
import MessageList  from '../components/MessageList';
import { getRoomID } from '../../utils';
import { useAuth } from '../authContext';
import { useRoute } from '@react-navigation/native';
import CustomKeyboardView from '../components/CustomKeyboardView';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addID } from '../features/Message/messageidSlice';
import firestore from '@react-native-firebase/firestore'
import MessageItem from '../components/MessageItem';
import { FlashList } from '@shopify/flash-list';
import {EXPOPUSHURL} from "@env"
import { TextInput } from 'react-native-paper';
const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [expoPushToken,setExpoPushToken] = useState('')
  const route = useRoute();
  const { item,} = route.params;
  const { user } = useAuth();

  const navigation = useNavigation();
  const dispatch = useDispatch()

  const textRef = useRef('');
  const inputRef = useRef(null);
  const flashListRef = useRef(null);

  
  const recipentNamec = route?.params?.userid 
            ? route?.params?.name 
            : item?.userId 
            ? item.name 
            : 'Unknown Recipient';
  useEffect(() => {
    const loadMessages = (roomId) => {
      const docRef = firestore().collection('rooms').doc(roomId);
      const messageRef = docRef.collection('messages').orderBy('createdAt', 'asc')
      let unsub = messageRef.onSnapshot((documentSnapshot) => {
        let allMessages = documentSnapshot.docs.map((doc) => doc.data());
        setMessages([...allMessages]);
      });
      return unsub;
    };
  
    const roomId = route?.params?.userid ? getRoomID(user?.userId, route?.params?.userid) : item?.userId ? getRoomID(user?.userId, item.userId) : null;
  
    if (roomId) {
      createRoom();
      dispatch(addID(route.params.userid));
      const unsubscribe = loadMessages(roomId);
      return () => unsubscribe();
    }
  
  }, [route?.params?.userid, item?.userId]);
  
  useEffect(() => {
    const getToken = async () => {
      try{
      const id = route?.params?.userid ? route?.params?.userid : item?.userId
      const docRef = firestore().collection('users').doc(id)
      const snapShot = await docRef.get()
        if(snapShot.exists){
          const data = snapShot.data()
          setExpoPushToken(data.expoToken)
        }else{
          console.error('No such document')
        }
      }catch(err){
        console.error('Error with grabbing token:',err)

      }
    }

    getToken()
    
  },[route?.params?.userid, item?.userId])

  const createRoom = async () => {
    try{
      
      const roomId = route?.params?.userid ? getRoomID(user?.userId, route?.params?.userid) : item?.userId ? getRoomID(user?.userId, item?.userId) : null
      const id = route?.params?.userid ? route?.params?.userid : item?.userId
      await firestore().collection('rooms').doc(roomId).set({
        roomId,
        createdAt: firestore.Timestamp.fromDate(new Date())
      })
      await firestore().collection('sent-message-id').doc(id).set({
        userId:id,
        name:recipentNamec,
        senderName:user?.username
      })
    } catch (error) {
      console.error("Error creating room:", error.message);
    }
  };

  const handleSend = async () => {
    let message = textRef.current.trim();
    if(!message) return;
    try{
      const roomId = route?.params?.userid
      ? getRoomID(user?.userId, route?.params?.userid)
      : item?.userId
      ? getRoomID(user?.userId, item.userId)
      : null;
      const docRef = firestore().collection('rooms').doc(roomId);
      const messageRef = docRef.collection('messages')
      //textRef.current ="";
      if(inputRef) inputRef?.current?.clear();
      await messageRef.add({
        userId:user?.userId,
        id:messageRef.doc().id,
        text:message,
        senderName: user?.username,
        recipentName:recipentNamec,
        createdAt: firestore.Timestamp.fromDate(new Date())
      })
      if (flashListRef.current) {
        flashListRef.current.scrollToEnd({ animated: true });
      }

      // Clear the input field after sending
      textRef.current = "";
      if (inputRef) inputRef?.current?.clear();

    }catch(error){
      console.error(`Error sending message:${error.message}`)
    }
  }

  return (
    <CustomKeyboardView
    inChat={true}
    style={styles.container}
    >
      <View style={{flex:1}}>
      <ChatRoomHeader 
      title={recipentNamec}
      backgroundColor={color.button} 
      icon='keyboard-backspace'
      iconColor='#00bf63'
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
          })} id={item.userId} message_text={item.text} currentUser={user}/>
        )}
        />
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.messageInput}>
          <TextInput
          left={<TextInput.Icon icon='camera' style={styles.sendButton} rippleColor='rgba(30, 136, 229, 0.3)'/>}
          dense={true}
          mode='outlined'
          outlineStyle={{borderRadius:100}}
          textColor='#000'
          placeholderTextColor='#000'
          style={[styles.textinput,{fontSize:hp(2),backgroundColor:color.grey}]}
            ref={inputRef}
            onChangeText={value => textRef.current = value}
            placeholder='Enter message....'
            right={<TextInput.Icon icon='send' style={styles.sendButton} onPress={handleSend} rippleColor='rgba(30, 136, 229, 0.3)'/>
            }
          />
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
    marginRight:5,
    marginLeft:5,
  },
  messageInput: {
    flexDirection:'row',
    padding:40,
  },
  textinput:{
    flexDirection:'row',
    marginRight:2,
    padding:5,
    height:35,
    borderRadius:30,
    borderTopLeftRadius:30,
    borderTopRightRadius:30
  },
  sendButton: {
    marginRight:1,
    paddingTop:10
  },
});

export default ChatScreen
