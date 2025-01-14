import {ScrollView} from 'react-native'
import MessageItem from './MessageItem';

const MessageList = ({messages,currentUser}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingTop:10}}>
      {
        messages.map((message,index) => {
          return (
            <MessageItem message={message} key={index} current_User={currentUser}/>
          )
          
        })
      }
    </ScrollView>
  )
}

export default MessageList




