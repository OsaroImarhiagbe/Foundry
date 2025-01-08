import React,{useState,useEffect} from 'react'
import {View,Text, StyleSheet,FlatList} from 'react-native'
import {usePushNotifications} from '../components/PushNotifications'
const NotificationScreen = () => {
  const {notification} = usePushNotifications()

  useEffect(()=>{
    if(notification){
      console.log(notification)
    }
  },[notification])
  return (
   <View style={styles.container}>
    <Text>Notification</Text>
    <FlatList
    data={notification}
    keyExtractor={(item,index) => index.toString()}
    renderItem={(item) => (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text>Title: {item && item.request.content.title} </Text>
      <Text>Body: {item && item.request.content.body}</Text>
      <Text>Data: {item && JSON.stringify(item.request.content.data)}</Text>
    </View>
    )}
    />
   </View>
  )
}
const styles = StyleSheet.create({
    container:{
        padding:10,
        marginVertical:70
    }
})
export default NotificationScreen
