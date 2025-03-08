import React,{
  useState,
  useEffect,
  lazy,
  Suspense,
  useCallback} from 'react'
import {
  View, 
  StyleSheet,
  SafeAreaView} from 'react-native'
import {
  collection,
  onSnapshot,} from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import color from '../../config/color';
import { useTheme,Text } from 'react-native-paper';
import { db,UsersRef,NotificationsRef, crashlytics} from 'FIrebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { log,recordError } from '@react-native-firebase/crashlytics'
import { FlashList } from '@shopify/flash-list';


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
  const {top} = useSafeAreaInsets()
  const Tab = createMaterialTopTabNavigator()
  const theme = useTheme()


  const getNotifications = useCallback(() => {
    log(crashlytics,'Notification Screen: get Notifications')
    try{
      if(user){
        const docRef = collection(db,'users',user?.userId,'notifications')
        const unsub = onSnapshot(docRef,(querySnapshot)=>{
        let messageOnly:Notification[] = []
        let all:Notification[] = []
        querySnapshot.forEach((documentSnapshot)=>{
          all.push({...documentSnapshot.data(),id:documentSnapshot.id})
          if (documentSnapshot.data().data == 'message'){
            messageOnly.push({...documentSnapshot.data()})
          }
        })
        setMessageNotifications([...messageOnly])
        setNotification([...all])
      })
      return unsub
      }
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error('Error grabbing notifications:',error.message)
      return ()  => {}
    }
  },[user?.userId])

  const onRefresh = useCallback(() => {
    log(crashlytics,'Notification Screen: On Refresh')
    setRefreshing(true);
    try{
      getNotifications()
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error('Error getting notifications',error.message)
    }finally{
      setRefreshing(false)
    }
  }, [getNotifications]);



  useEffect(() => {
    const unsubscribe = getNotifications()
    return () => {
      unsubscribe
    }
  }, [getNotifications])



  const MessagesNotifications = () => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
        <FlashList
        estimatedItemSize={460}
        data={messageNotifications}
        ListEmptyComponent={() => <View style={{paddingTop:20}}><Text
          variant='bodySmall'
        style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No Notifications Available</Text></View>}
        renderItem={({item}) =>  
          <View style={{padding: 10}}>
            <View style={{backgroundColor:color.grey,padding:20,borderRadius:20}}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationText}>{item.body}</Text>
            </View>
          </View>}/>
    </SafeAreaView>
    </View>
    
  ); 
  
  const Notifcations = () => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
      <FlashList
      estimatedItemSize={460}
        data={notification}
        ListEmptyComponent={() => <View style={{paddingTop:20}}><Text
          variant='bodySmall'
        style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No Notifications Available</Text></View>}
        renderItem={({item}) =>  
          <View style={{padding: 10}}>
            <View style={{backgroundColor:color.grey,padding:20,borderRadius:20}}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationText}>{item.body}</Text>
            </View>
          </View>}/>
    </SafeAreaView>
    </View>
    
  );
  const Mentions = () => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
      <FlashList
      estimatedItemSize={460}
        data={messageNotifications}
        ListEmptyComponent={() => <View style={{paddingTop:20}}><Text
          variant='bodySmall'
        style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No Notifications Available</Text></View>}
        renderItem={({item}) =>  
          <View style={{padding: 10}}>
            <View style={{backgroundColor:color.grey,padding:20,borderRadius:20}}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationText}>{item.body}</Text>
            </View>
          </View>}/>
    </SafeAreaView>
    </View>
    
  );
  return (
   <View style={[styles.screen,{backgroundColor:theme.colors.background}]}>
    <View style={[styles.headingContainer,{marginTop:top}]}>
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
      backgroundColor:theme.colors.primary
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
