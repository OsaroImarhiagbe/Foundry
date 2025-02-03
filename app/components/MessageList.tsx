import {ScrollView} from 'react-native'
import MessageItem from './MessageItem';
import { Key } from 'react';

interface Message{
  messages?:any,
  currentUser?:any,
}

const MessageList:React.FC<Message> = ({messages,currentUser}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingTop:10}}>
      {
        messages.map((message:any,index:string) => {
          return (
            <MessageItem message_text={message} key={index} current_User={currentUser}/>
          )
          
        })
      }
    </ScrollView>
  )
}

export default MessageList




