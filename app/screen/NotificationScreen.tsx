import React,{
  useState,
  useEffect,
  useCallback} from 'react'
import {
  View, 
  StyleSheet,
  SafeAreaView} from 'react-native'
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme,Text, Divider } from 'react-native-paper';
import { crashlytics, database,} from '../../FirebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { log,recordError } from '@react-native-firebase/crashlytics'
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { onValue, ref, update } from '@react-native-firebase/database';
import { useNotification } from '../NotificationProvider';


interface Notification{
  id:string,
  title:string,
  message:string,
  timestamp:string
}
const NotificationScreen = () => {
  const {user} = useAuth()
  const [messageNotifications,setMessageNotifications] = useState<Notification[]>([])
  const [notification,setNotification] = useState<Notification[]>([])
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading,setLoading] = useState<boolean>(true)
  const {top} = useSafeAreaInsets()
  const Tab = createMaterialTopTabNavigator()
  const {setNotificationCount} = useNotification();
  const theme = useTheme()




  const onRefresh = useCallback(() => {
    log(crashlytics,'Notification Screen: On Refresh')
    setRefreshing(true);
    try{
      const notificationRef = ref(database,`/notfications/${user.userId}`)
        const unsub = onValue(notificationRef,(snapshot)=>{
          if(!snapshot.exists()){
            setMessageNotifications([])
            setNotification([])
            setRefreshing(false)
            return;
          }
        const messageOnly:Notification[] = []
        const all:Notification[] = []
        snapshot.forEach((childSnapshot)=>{
          all.push({...childSnapshot.val(),id:childSnapshot.key})
          update(ref(database, `/notfications/${user.userId}/${childSnapshot.key}`), { isRead: true })
          setNotificationCount(null)
          if (childSnapshot.val().data.type == 'message'){
            update(ref(database, `/notfications/${user.userId}/${childSnapshot.key}`), { isRead: true })
            setNotificationCount(null)
            messageOnly.push({...childSnapshot.val()})
          }
          return true;
        })
        setMessageNotifications([...messageOnly])
        setNotification([...all])
        setRefreshing(false)
      })
      return () => unsub()
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error('Error grabbing notifications:',error.message)
      setLoading(false)
    }finally{
      setRefreshing(false)
    }
  }, []);



  useEffect(() => {
    try{
        const notificationRef = ref(database,`/notfications/${user.userId}`)
        const unsub = onValue(notificationRef,(snapshot)=>{
          if(!snapshot.exists()){
            setMessageNotifications([])
            setNotification([])
            setLoading(false)
            return
          }
        const messageOnly:Notification[] = []
        const all:Notification[] = []
        snapshot.forEach((childSnapshot)=>{
          all.push({...childSnapshot.val(),id:childSnapshot.key})
          update(ref(database, `/notfications/${user.userId}/${childSnapshot.key}`), { isRead: true })
          setNotificationCount(null)
          if (childSnapshot.val().data.type == 'message'){
            update(ref(database, `/notfications/${user.userId}/${childSnapshot.key}`), { isRead: true })
            setNotificationCount(null)
            messageOnly.push({...childSnapshot.val()})
          }
          return true
        })
        setMessageNotifications(messageOnly)
        setNotification(all)
        setLoading(false)
      })
      return () => unsub()
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error('Error grabbing notifications:',error.message)
      setLoading(false)
    }finally{
      setLoading(false)
    }
  }, [])



  const MessagesNotifications = React.memo(() => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
        <FlashList
        onRefresh={onRefresh}
        estimatedItemSize={460}
        refreshing={refreshing}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString() }
        data={messageNotifications}
        ListEmptyComponent={() => <View style={{paddingTop:20}}><Text
          variant='bodySmall'
        style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No Notifications Available</Text></View>}
        renderItem={({item}) =>  
          <MotiView
          transition={{
            type:'timing'
          }}
          style={{padding: 10}}>
            <Skeleton>
            <View style={{padding:20,borderRadius:20}}>
            <Text
            variant='bodyMedium'
             style={{
              color:theme.colors.tertiary
            }}>{item.title}</Text>
            <Text variant='bodyMedium'
             style={{
              color:theme.colors.tertiary
            }}>{item.message}</Text>
            </View>
            </Skeleton>
          </MotiView>}/>
    </SafeAreaView>
    </View>
    
  )); 
  
  const Notifcations = React.memo(() => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
      <FlashList
      onRefresh={onRefresh}
      keyExtractor={(item,index) => item.id?.toString() || `defualt-${index}`}
      estimatedItemSize={460} 
      data={notification}
      refreshing={refreshing}
      ItemSeparatorComponent={()=> (
        <Divider/>
      )}
      ListEmptyComponent={() => <View style={{paddingTop:20}}><Text
          variant='bodySmall'
        style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No Notifications Available</Text></View>}
        renderItem={({item}) =>  
          <MotiView
        transition={{
          type:'timing'
        }}
        style={{padding: 10}}>
        <Skeleton>
        <View style={{padding:20,borderRadius:20}}>
        <Text
        variant='bodyMedium'
         style={{
          color:theme.colors.tertiary
        }}>{item.title}</Text>
        <Text variant='bodyMedium'
         style={{
          color:theme.colors.tertiary
        }}>{item.message}</Text>
         <Text variant='bodyMedium'
         style={{
          color:theme.colors.tertiary
        }}>{item.timestamp}</Text>
        </View>
        </Skeleton>
      </MotiView>}/>
    </SafeAreaView>
    </View>
    
  ));
  const Mentions = React.memo(() => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
      <FlashList
      refreshing={refreshing}
      onRefresh={onRefresh}
      estimatedItemSize={460}
      keyExtractor={(item,index) => item.id?.toString() || `default-${index}`}
      data={messageNotifications}
      ListEmptyComponent={() => <View style={{paddingTop:20}}><Text
          variant='bodySmall'
        style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No Notifications Available</Text></View>}
        renderItem={({item}) =>  
          <MotiView
        transition={{
          type:'timing'
        }}
        style={{padding: 10}}>
            <Skeleton>
            <View style={{padding:20,borderRadius:20}}>
            <Text
            variant='bodyMedium'
             style={{
              color:theme.colors.tertiary
            }}>{item.title}</Text>
            <Text variant='bodyMedium'
             style={{
              color:theme.colors.tertiary
            }}>{item.message}</Text>
            </View>
            </Skeleton>
          </MotiView>}/>
    </SafeAreaView>
    </View>
    
  ));
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
})
export default NotificationScreen
