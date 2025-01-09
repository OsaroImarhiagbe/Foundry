import React,{useState,useEffect,lazy,Suspense,useCallback} from 'react'
import {View,Text, StyleSheet,FlatList,ScrollView,ActivityIndicator,RefreshControl} from 'react-native'
import { db} from '../../FireBase/FireBaseConfig';
import { collection,onSnapshot,query,where,doc } from 'firebase/firestore';
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import color from '../../config/color';
const NotificationScreen = () => {
  const {user} = useAuth()
  const [messageNotifications,setMessageNotifications] = useState([])
  const [notification,setNotification] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const Tab = createMaterialTopTabNavigator()

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getAllNotifications()
    await getNotifications()
    setRefreshing(false);
  }, [messageNotifications,notification]);

  useEffect(() => {
    if(!messageNotifications || !notification){
      setMessageNotifications([])
      setNotification([])
      return
    }
    getAllNotifications()
    getNotifications()
  },[user.userId])
  const getAllNotifications = () => {
    try{
      const docRef = doc(db,'users',user?.userId)
      const notificationRef = collection(docRef,'notifications')
      const unsub = onSnapshot(notificationRef,(snapShot)=>{
        let data = []
        snapShot.forEach((doc)=>{
          data.push({...doc.data(),id:doc.id})
        })
        setNotification([...data])
      })
      return unsub
    }catch(err){
      console.error('Error grabbing notifications',err)
    }
  }
  const getNotifications = () => {
    try{
      const docRef = doc(db,'users',user?.userId)
      const notificationRef = collection(docRef,'notifications')
      const q = query(notificationRef,where('notification_data','==','message'))
      const unsub = onSnapshot(q,(snapShot)=>{
        let data = []
        snapShot.forEach((doc)=>{
          data.push({...doc.data(),id:doc.id})
        })
        setMessageNotifications([...data])
      })
      return unsub
    }catch(err){
      console.error('Error grabbing notifications',err)
    }
  }


  const MessagesNotifications = () => (
    <ScrollView
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
    scrollEnabled={true}
     style={{flex:1,backgroundColor:color.backgroundcolor}}>
      <View style={{flex:1,backgroundColor:color.backgroundcolor}}>
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
    </View>
    </ScrollView>
    
  ); 
  
  const Notifcations = () => (
    <ScrollView
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
    scrollEnabled={true}
     style={{flex:1,backgroundColor:color.backgroundcolor}}>
      <View style={{flex:1,backgroundColor:color.backgroundcolor}}>
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
    </View>
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
