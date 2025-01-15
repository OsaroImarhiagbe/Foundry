import React, {useState, useEffect,lazy,Suspense,useCallback} from 'react'
import {View, Text, StyleSheet, Platform, StatusBar,ActivityIndicator,ScrollView,RefreshControl,SafeAreaView} from 'react-native'
import color from '../../config/color';
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
const ChatList = lazy(() => import('../../List/ChatList'))


const MessageScreen = () => {


  const [users, setUsers] = useState([]);
  const navigation = useNavigation();
  const { user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const list_of_ids = useSelector((state)=> state.message.messagesID)

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    grabUser(list_of_ids); 
    setRefreshing(false); 
  }, [list_of_ids]);

  useEffect(() => {
    let unsub
    const fetchUser =  () => {
      unsub = grabUser(list_of_ids)
    }

    fetchUser()
    return () => {if(unsub) unsub()}
  },[list_of_ids])

  const grabUser = (list_of_ids) => {
    if (!list_of_ids || list_of_ids.length === 0) {
      setUsers([]);
      console.warn("list_of_ids is empty or undefined."); 
      return;
    }
    const unsub = firestore()
    .collection('sent-message-id')
    .where('userId','!=',user.userId)
    .onSnapshot((documentSnapshot) =>{
      let data = []
      documentSnapshot.forEach(doc => {
        data.push({...doc.data()})
      })
      setUsers(data)
    },(err)=>{
      console.error(`Failed to grab users: ${err.message}`)
    })
    return unsub
  }
  
  const handlePress = () => {
    navigation.navigate('Main');
  }
 


  return (
    <View style={styles.screen}>
      <ChatRoomHeader title='Message' onPress={handlePress} icon='keyboard-backspace' backgroundColor={color.button}/>
      <ScrollView
      style={{flex:1}}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
      >
      <View style={styles.container}>
      <View style={{marginTop:5}}>
       {users.length > 0 ? (
        <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
            <ChatList currentUser={user} otherusers={users}/>
        </Suspense>
       ): (<View>
        <View style={{justifyContent:'center',alignItems:'center',flex:1,marginTop:40}}>
        <Text style={styles.text}>Send a new message!</Text>
        </View>
       </View>)}
       </View>
    </View>
      </ScrollView>
  </View>
  )
}


const styles = StyleSheet.create({
    screen:{
      paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
      flex:1,
      backgroundColor:color.backgroundcolor
    },
    text:{
      color:'#fff',
      fontSize:20,
      fontFamily:'Helvetica-light'
      },
})
export default MessageScreen
