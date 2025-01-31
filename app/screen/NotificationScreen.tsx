import React,{useState,useEffect,lazy,Suspense,useCallback} from 'react'
import {View,Text, StyleSheet,FlatList,ScrollView,ActivityIndicator,RefreshControl,SafeAreaView} from 'react-native'
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import color from '../../config/color';
const NotificationScreen = () => {
  const {user} = useAuth()
  const [messageNotifications,setMessageNotifications] = useState([])
  const [notification,setNotification] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const Tab = createMaterialTopTabNavigator()

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try{
      getNotifications()
    }catch(err){
      console.error('Error getting notifications',err)
    }finally{
      setRefreshing(false)
    }
  }, [getNotifications]);


  const getNotifications = useCallback(() => {
    try{
      if(user){
        const unsub = firestore()
      .collection('users')
      .doc(user?.uid)
      .collection('notifications')
      .onSnapshot((querySnapshot)=>{
        let messageOnly = []
        let all = []
        querySnapshot.forEach((documentSnapshot)=>{
          all.push({...documentSnapshot.data(),id:documentSnapshot.id})
          if (documentSnapshot.data().notification_data == 'message'){
            messageOnly.push({...doc.data()})
          }
        })
        setMessageNotifications([...messageOnly])
        setNotification([...all])
      })
      return () => unsub()
      }
    }catch(err){
      console.error('Error grabbing notifications',err)
    }
  },[user?.userId])

  useEffect(() => {
    if(!messageNotifications || !notification){
      setMessageNotifications([])
      setNotification([])
      return
    }
    let unsub = () => {}
    const getNotif = () => {
      unsub = getNotifications()
    }

    getNotif()
    return () => {
      if(unsub) unsub()
    }
    
  },[user?.userId,getNotifications])


  const MessagesNotifications = () => (
    <ScrollView
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
    scrollEnabled={true}
     style={{flex:1,backgroundColor:color.backgroundcolor}}>
      <SafeAreaView style={{flex:1,backgroundColor:color.backgroundcolor}}>
        {
        messageNotifications &&  messageNotifications.length > 0 ? (
            messageNotifications.map((message,index) => (
              <Suspense key={index} fallback={<ActivityIndicator size="large" color="#fff" />}>
                <View style={{padding: 10}}>
                  <View style={{backgroundColor:color.grey,padding:20,borderRadius:20}}>
                  <Text style={styles.notificationTitle}>{message.title}</Text>
                  <Text style={styles.notificationText}>{message.body}</Text>
                  </View>
                </View>
              </Suspense>
            ))) : <View style={{paddingTop:20}}><Text style={{ color: '#fff', textAlign: 'center', fontFamily:color.textFont,fontSize:20}}>No Notifications Available</Text></View>}
    </SafeAreaView>
    </ScrollView>
    
  ); 
  
  const Notifcations = () => (
    <ScrollView
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
    scrollEnabled={true}
     style={{flex:1,backgroundColor:color.backgroundcolor}}>
      <SafeAreaView style={{flex:1,backgroundColor:color.backgroundcolor}}>
        {
        notification && notification.length > 0 ? (
            notification.map((notifications,index) => (
              <Suspense key={index} fallback={<ActivityIndicator size="large" color="#fff" />}>
                <View style={{padding: 10}}>
                  <View style={{backgroundColor:color.grey,padding:20,borderRadius:20}}>
                  <Text style={styles.notificationTitle}>{notifications.title}</Text>
                  <Text style={styles.notificationText}>{notifications.body}</Text>
                  </View>
                </View>
              </Suspense>
            ))) : <View style={{paddingTop:20}}><Text style={{ color: '#fff', textAlign: 'center', fontFamily:color.textFont,fontSize:20}}>No Notifications Available</Text></View>}
    </SafeAreaView>
    </ScrollView>
    
  );
  return (
   <View style={styles.screen}>
    <View style={styles.headingContainer}>
    <Text style={styles.headingText}>Notifications</Text>
    </View>
    <View style={{flex:1}}>
    <Tab.Navigator
  screenOptions={{
    headerShown:false,
    swipeEnabled:true,
    tabBarIndicatorStyle:{
      backgroundColor:'#00BF63'
    },
    tabBarStyle:{
      backgroundColor:color.backgroundcolor,
    },
  }}
  >
    <Tab.Screen
      name='Messages'
      component={MessagesNotifications}
      options={{
        tabBarLabel:'Messages',
        tabBarLabelStyle:{
          color:color.textcolor,
          fontFamily:color.textFont,
          fontSize:20
        }
      }}
      />
      <Tab.Screen
      name='Notications'
      component={Notifcations}
      options={{
        tabBarLabel:'All',
        tabBarLabelStyle:{
          color:color.textcolor,
          fontFamily:color.textFont,
          fontSize:20
        }
      }}
      />
    </Tab.Navigator>
  </View>
   </View>
  )
}
const styles = StyleSheet.create({
    screen:{
      flex:1,
      backgroundColor:color.backgroundcolor
    },
    headingContainer:{
      paddingTop:90,
      padding:10,
    },
    headingText:{
      color:color.textcolor,
      fontSize:30,
      fontFamily:color.textFont,
      paddingLeft:10
    },
    notificationTitle:{
      color:color.textcolor,
      fontFamily:color.textFont,
      fontSize:20
    },
    notificationText:{
      color:color.textcolor,
      fontFamily:color.textFont,
      fontSize:15
    }
})
export default NotificationScreen
