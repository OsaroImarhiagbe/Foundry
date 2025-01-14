import React from 'react'
import { View, Text, StyleSheet} from 'react-native'

const MessageChat = ({user,item}) => {  
    const currentUserstatus = item.user !== user
  return (
 <View style={currentUserstatus ? {} : {alignItems: 'flex-end'}}>
    <View style={styles.messageItemwrapper}>
        <View style={styles.messageInnerwrapper}>
            <View style={currentUserstatus ? styles.messageItem : [styles.messageItem, {backgroundColor:'#703efe'}]}>
                <Text style={currentUserstatus ? {color: '#000'} : {color:'#e5c1fe'}}>
                    {item.text}
                </Text>
            </View>
        </View>
        <Text style={styles.messagetime}>{item.time}</Text>
    </View>
 </View>
  )
}

const styles = StyleSheet.create({
    messageItemwrapper:{
        maxWidth:'50%',
        marginBottom:15
    },
    messageInnerwrapper:{
        flexDirection:'row',
        alignItems:'center'
    },
    messageItem:{
        width:'100%',
        backgroundColor:'#fff',
        padding:20,
        borderRadius:10,
        marginBottom:2
    },
    messagetime:{
        marginLeft:10
    }
})

export default MessageChat
