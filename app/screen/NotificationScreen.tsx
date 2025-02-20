import React,{
  useState,
  useEffect,
  lazy,
  Suspense,
  useCallback} from 'react'
import {
  View, 
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView} from 'react-native'
import {collection} from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import color from '../../config/color';
import { useTheme,Text } from 'react-native-paper';
import { db } from 'FIrebaseConfig';
import crashlytics, { crash } from '@react-native-firebase/crashlytics'


interface Notification{
  id?:string,
  title?:string,
  body?:string
}
const NotificationScreen = () => {
  const {user} = useAuth()
  const [messageNotifications,setMessageNotifications] = useState<Notification[]>([])
  const [notification,setNotification] = useState<Notification[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const Tab = createMaterialTopTabNavigator()
  const theme = useTheme()


  const getNotifications = useCallback(() => {
    crashlytics().log('Notification Screen: get Notifications')
    try{
      if(user){
        const unsub = collection(db,'users')
      .doc(user?.uid)
      .collection('notifications')
      .onSnapshot((querySnapshot)=>{
        let messageOnly:Notification[] = []
        let all:Notification[] = []
        querySnapshot.forEach((documentSnapshot)=>{
          all.push({...documentSnapshot.data(),id:documentSnapshot.id})
          if (documentSnapshot.data().notification_data == 'message'){
            messageOnly.push({...documentSnapshot.data()})
          }
        })
        setMessageNotifications([...messageOnly])
        setNotification([...all])
      })
      return () => unsub()
      }
    }catch(error:unknown | any){
      crashlytics().recordError(error)
      console.error('Error grabbing notifications',error.message)
    }
  },[user?.userId])

  const onRefresh = useCallback(() => {
    crashlytics().log('Notification Screen: On Refresh')
    setRefreshing(true);
    try{
      getNotifications()
    }catch(error:unknown | any){
      crashlytics().recordError(error)
      console.error('Error getting notifications',error.message)
    }finally{
      setRefreshing(false)
    }
  }, [getNotifications]);




  useEffect(() => {
    if(!messageNotifications || !notification){
      setMessageNotifications([])
      setNotification([])
      return
    }
    let unsub = () => {}
    const getNotif = () => {
     getNotifications()
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
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
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
            ))) : <View style={{paddingTop:20}}>
              <Text 
            variant='bodySmall' 
            style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No Notifications Available</Text></View>}
    </SafeAreaView>
    </ScrollView>
    
  ); 
  
  const Notifcations = () => (
    <ScrollView
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
    scrollEnabled={true}
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
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
            ))) : <View style={{paddingTop:20}}>
              <Text
              variant='bodySmall'
            style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No Notifications Available</Text></View>}
    </SafeAreaView>
    </ScrollView>
    
  );
  const Mentions = () => (
    <ScrollView
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
    scrollEnabled={true}
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
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
   <View style={[styles.screen,{backgroundColor:theme.colors.background}]}>
    <View style={styles.headingContainer}>
    <Text
    variant='titleLarge'
    style={{
      fontSize:24,
      textAlign:'center',
      color:theme.colors.tertiary
    }}>Notifications</Text>
    </View>
    <View style={{flex:1}}>
    <Tab.Navigator
  screenOptions={{
    swipeEnabled:true,
    tabBarIndicatorStyle:{
      backgroundColor:theme.colors.tertiary
    },
    tabBarStyle:{
      backgroundColor:theme.colors.background
    },
  }}
  >
    <Tab.Screen
      name='Messages'
      component={MessagesNotifications}
      options={{
        tabBarLabel:'Messages',
        tabBarLabelStyle:{
          color:theme.colors.tertiary,
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
          color:theme.colors.tertiary,
          fontSize:20
        }
      }}
      />
        <Tab.Screen
      name='Mentions'
      component={Mentions}
      options={{
        tabBarLabel:'Mentions',
        tabBarLabelStyle:{
          color:theme.colors.tertiary,
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
    },
    headingContainer:{
      paddingTop:90,
      padding:10,
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
