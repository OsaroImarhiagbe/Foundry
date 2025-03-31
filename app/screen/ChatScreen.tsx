import {
  useCallback,
  useMemo
} from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  }  from 'react-native'
import React, { useState, useEffect, useRef} from 'react'
import { getRoomID, TimeAgo } from '../../utils';
import { useAuth } from '../authContext';
import { useRoute,RouteProp } from '@react-navigation/native';
import CustomKeyboardView from '../components/CustomKeyboardView';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import MessageItem from '../components/MessageItem';
import { FlashList } from '@shopify/flash-list';
import { TextInput,useTheme,Text } from 'react-native-paper';
import { log,recordError} from '@react-native-firebase/crashlytics'
import { functions, crashlytics, perf, database,} from '../../FirebaseConfig';
import { httpsCallable } from '@react-native-firebase/functions'
import { limitToLast, onValue, orderByChild, ref,query, get} from '@react-native-firebase/database';





type ChatScreenRouteProp = RouteProp<{ Chat: { item: any,userid:string,name:string } }, 'Chat'>;
interface Messages{
  id?:string,
  text?:string,
  recipentId?:string,
  createdAt:number
}
const ChatScreen = () => {
  const [messages, setMessages] = useState<Messages[]>([]);
  const route = useRoute<ChatScreenRouteProp>();
  const {item,userid,name} = route?.params;
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const navigation = useNavigation();
  const flashListRef = useRef<FlashList<any> | null>(null);
  const theme = useTheme()
  const [focus,setFocus] = useState(false)
  const inputRef = useRef<any>(null)

  const roomId = userid ? getRoomID(user?.userId, userid) : item.participants.user_1 ? getRoomID(item.participants.user_2, item.participants.user_1) : null; 
  let recipient_id:string;
  if(userid){
    recipient_id = userid
  }else if(item?.participants){
    recipient_id = item.participants.user_1 === user.userId ? item.participants.user_2 : item.participants.user_1
  }else{
    recipient_id = '';
  }
  const recipientName = userid ? name  : item.participants.user_1  ? item.participants.username_1 : 'Unknown Recipient'; 


  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    },100);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    log(crashlytics,'Chat Screen: Grabbing messages')
    const loadMessages = (roomId:string) => {
      const messageRef = ref(database,`/messages/${roomId}`);
      const q = query(messageRef ,orderByChild('createdAt'),limitToLast(20))
      const unsub = onValue(q,(snapshot) => {
        const allMessages:Messages[] = []
        if(!snapshot.exists()){
          setMessages([])
          return;
        }
        Object.keys(snapshot.val()).forEach((key) => {
          allMessages.push({...snapshot.val()[key],id:key})
        })
        setMessages(allMessages.reverse() as Messages[])
      });
      return () => unsub();
    };
    if (roomId && recipient_id) {
      createRoom(roomId,recipient_id);
      //dispatch(addID(userid));
      loadMessages(roomId);
    }
  
  }, [userid, item?.participants?.user_1 ]);

  const createRoom = useCallback(async (roomId:string,recipient_id:string) => {
    log(crashlytics,'Chat Screen: Creating Chat Room')
    try{
      const chatroomRef = ref(database,`/chats/${roomId}`)
      const snapshot = await get(chatroomRef);
      if(!snapshot.exists()){
        await chatroomRef.set({
          participants:{
            user_1:user?.userId,
            username_1:user?.username,
            user_2:recipient_id,
            username_2:recipientName
          },
          lastMessage:{
            roomId:roomId,
            recipientId: recipient_id, 
            senderId:user.userId,
            content:" ",
            status:"pending",
            createdAt: Date.now(),
            recipientName:recipientName,
            senderName:user?.username
          }
        })
      }
    } catch (error:unknown | any) {
      recordError(crashlytics,error)
      console.error("Error creating room:", error.message);
    }
  },[roomId,recipient_id]);

  const handleSend = useCallback(async () => {
    log(crashlytics,'Chat Screen: Sening Messages ')
    let trace = await perf.startTrace('send_chat_message')
    if(messageText.trim() === '') return;
    try{
      if(focus){
        const addMessage = httpsCallable(functions,'addMessage')
        addMessage({
          senderId: user?.userId,
          recipientId: [recipient_id],
          roomId: roomId,
          senderName: user?.username,
          recipientName: recipientName,
          content: messageText,
          status:"sent"
        }).then((results) => {
          console.log(results)
        }).catch((error) => {
          recordError(crashlytics,error)
          console.log('Chat Screen Error: ',error.message)
        })
        setMessageText('');
        inputRef.current?.focus();
        if (flashListRef.current) {
          flashListRef.current.scrollToEnd({ animated: true });
        }
      }
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error(`Error sending message:${error.message}`)
    }finally{
      trace.stop()
    }
  },[messageText, userid, item?.participants?.user_1 , user?.userId, recipientName])

  return (
    <CustomKeyboardView
    inChat={true}
    >
      <View style={{flex:1}}>
        { user.userId === item.participants.user_1 ? (
           <ChatRoomHeader 
           title={recipientName ? item.participants.username_2 : recipientName}
           backgroundColor='transparent'
           icon='keyboard-backspace'
           iconColor='#00bf63'
           icon2='camera'
           icon3='phone'
           onPress={() => navigation.goBack()}/>) :  (<ChatRoomHeader 
           title={item.participants.username_1}
           backgroundColor='transparent'
           icon='keyboard-backspace'
           iconColor='#00bf63'
           icon2='camera'
           icon3='phone'
           onPress={() => navigation.goBack()}/>)}
      <View style={styles.messagesContainer}>
      <FlashList
        ref={flashListRef}
        inverted
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{padding:10}}
        data={messages}
        keyExtractor={item => item?.id?.toString()}
        estimatedItemSize={360}
        renderItem={({item}) => (
          <MessageItem  date={TimeAgo(item.createdAt)} 
          recipient_id={item.recipientId} message_text={item.content} current_User={user}/>
        )}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
        ref={inputRef}
        left={<TextInput.Icon 
          icon='camera'
          size={20} 
          style={[styles.cameraButton,{alignSelf:'center',paddingBottom:5}]}
         />}
        mode='outlined'
        value={messageText}
        outlineStyle={{borderRadius:100}}
        textColor={theme.colors.tertiary}
        placeholderTextColor={theme.colors.tertiary}
        style={{backgroundColor:theme.colors.onBackground,flexDirection:'row'}}
        onChangeText={(text) => setMessageText(text)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder='Start a message....'
        right={messageText.trim() !== '' && (<TextInput.Icon 
          icon='send'
          color={theme.colors.background}
          size={20}
          style={styles.sendButton} 
          onPress={handleSend} 
          />)
        }
          /> 
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
    justifyContent:'space-around',
    alignItems:'flex-end',
    padding:10
  },
  sendButton: {
    paddingBottom:5,
    paddingRight:5,
    paddingLeft:5,
    paddingTop:5,
    backgroundColor:'lightblue',
  },
  cameraButton: {
    marginRight:1,
    paddingTop:10,
    justifyContent:'center'
  },
});

export default ChatScreen
