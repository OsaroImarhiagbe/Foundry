
import {View,StyleSheet,TouchableOpacity,TextInput}  from 'react-native'
import color from'../../config/color';
import React, { useState, useEffect, useRef} from 'react'
import MessageList  from '../components/MessageList';
import { getRoomID } from '../../utils';
import { useAuth } from '../authContext';
import { useRoute } from '@react-navigation/native';
import CustomKeyboardView from '../components/CustomKeyboardView';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addID } from '../features/Message/messageidSlice';
import firestore from '@react-native-firebase/firestore'
import axios from 'axios'
import {EXPOPUSHURL} from "@env"
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
        if(snapShot.exists()){
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
      await firestore().collection('rooms').doc(roomId).setDoc({
        roomId,
        createdAt: firestore.Timestamp.fromDate(new Date())
      })
      await firestore().collection('sent-message-id').doc(route?.params?.userid).set({
        userId:route?.params?.userid,
        name:recipentNamec
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
      textRef.current ="";
      if(inputRef) inputRef?.current?.clear();
      await messageRef.add({
        userId:user?.userId,
        text:message,
        senderName: user?.username,
        recipentName:recipentNamec,
        createdAt: firestore.Timestamp.fromDate(new Date())
      })
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: `${user.username} sent you a message.`,
        body: message,
        data: { type: 'message' },
        _contentAvailable: true
      };
      await axios.post(EXPOPUSHURL,message, {
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });
    }catch(error){
      console.error(`${error}`)
    }
  }

  return (
    <CustomKeyboardView
    inChat={true}
    style={styles.container}
    >
      <ChatRoomHeader 
      title={recipentNamec}
      backgroundColor={color.button} 
      icon='keyboard-backspace'
      onPress={() => navigation.goBack()}/>
      <View style={styles.messagesContainer}>
        <MessageList messages={messages} currentUser={user} />
      </View>
      <View style={{paddingTop:5}}>
      <View style={styles.inputContainer}>
        <View style={styles.messageInput}>
          <TextInput
          style={[styles.textinput,{fontSize:hp(2)}]}
            ref={inputRef}
            onChangeText={value => textRef.current = value}
            placeholder='Enter message....'
          />
          <TouchableOpacity onPress={handleSend}>
            <View style={styles.sendButton}>
            <Feather
            name='send'
            size={20}
            color='#737373'/>
            </View>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff'
  },
  messagesContainer: {
    flex: 1,
    padding:2
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginRight:3,
    marginLeft:3,
    paddingBottom:70
  },
  messageInput: {
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:color.white,
    borderWidth:2,
    borderColor:color.grey,
    borderRadius:30
  },
  textinput:{
    flex:1,
    marginRight:2,
    padding:10
  },
  sendButton: {
    padding: 10,
    marginRight:1
  },
});

export default ChatScreen
