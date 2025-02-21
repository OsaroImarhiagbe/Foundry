import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useCallback} from 'react'
import {
  View,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity
  } from 'react-native'
import color from '../../config/color';
import {
  FirebaseFirestoreTypes,
  where,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter, 
  getDocs } from '@react-native-firebase/firestore';
import { useAuth } from '../authContext';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator,Text,useTheme,Icon } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
//import crashlytics from '@react-native-firebase/crashlytics'
import { ChatRoomsRef} from 'FIrebaseConfig';
import SearchComponent from 'app/components/SearchComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatList = lazy(() => import('../../List/ChatList'))


interface User{
  id?:string
}

type NavigationProp = {
  Dash?:undefined
}

type Navigation = NativeStackNavigationProp<NavigationProp>
const MessageScreen = () => {


  const [users, setUsers] = useState<User[]>([]);
  const {top} = useSafeAreaInsets()
  const navigation = useNavigation<Navigation>();
  const { user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);
  const theme = useTheme()

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try{
        //crashlytics().log('Grabbing Users Message')
        if (!users) {
          setUsers([]);
          return;
        }
        const docRef = query(ChatRoomsRef, where('senderName','!=',user.username),where('recipientName','==',user.username))
        const unsub = onSnapshot(docRef,(querySnapshot) =>{
          let data:User[] = []
          querySnapshot.forEach(doc => {
            data.push({...doc.data()})
          })
          setUsers(data)
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
          setHasMore(querySnapshot.docs.length > 0)
        },(err)=>{
          //crashlytics().recordError(err)
          console.error(`Failed to grab users: ${err.message}`)
        })
        return unsub
    }catch(error:any){
      //crashlytics().recordError(error)
    }finally{
    setRefreshing(false); 
    }
  }, [users]);

  useEffect(() => {
    const grabMessageSent = () => {
      //crashlytics().log('Grabbing Users Message')
      if (!users) {
        setUsers([]);
        return;
      }
      const docRef = query(ChatRoomsRef, where('senderName','!=',user.username),where('recipientName','==',user.username))
      const unsub = onSnapshot(docRef,(querySnapshot) =>{
        let data:User[] = []
        querySnapshot.forEach(doc => {
          data.push({...doc.data()})
        })
        setUsers(data)
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
        setHasMore(querySnapshot.docs.length > 0)
      },(err)=>{
        //crashlytics().recordError(err)
        console.error(`Failed to grab users: ${err.message}`)
      })
      return unsub
    }
    grabMessageSent()
  },[users])
  
  const fetchMoreMessage = async () => {
    //crashlytics().log('Fetch more Message')
    if (loadingMore || !hasMore) return;
    if (!user?.userId) return;
    if (users.length <= 2) {
      setHasMore(false);
      return;
    }
    setLoadingMore(true);
    try {
      const docRef = lastVisible ? query(
        ChatRoomsRef,
        orderBy('createAt','desc'),
        startAfter(lastVisible), 
        limit(2)) : 
        query(
          ChatRoomsRef,
          orderBy('createdAt', 'desc'),
          limit(2))
      const snapshot = await getDocs(docRef)
      const newMessgae = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(prev => [...prev, ...newMessgae]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length > 0);
    } catch (error:unknown | any) {
      //crashlytics().recordError(error)
      console.error(`Error fetching more posts: ${error}`);
    } finally {
      setLoadingMore(false);
    }
  }


  return (
    <View style={[styles.screen,{backgroundColor:theme.colors.background}]}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:top,padding:10}}>
        <TouchableOpacity onPress={() => navigation.navigate('Dash')}>
        <Icon source='arrow-left-bold-circle' size={25}/>
        </TouchableOpacity>3
        <SearchComponent title='Search Message...'/>
      <Icon source='dots-horizontal' size={25}/>
      <Icon source='message' size={25}/>
      </View>
      <View style={{marginTop:5,flex:1}}>
      <FlashList
      estimatedItemSize={460}
      onRefresh={onRefresh}
      data={users}
      refreshing={refreshing}
      onEndReached={fetchMoreMessage}
      onEndReachedThreshold={0.1}
      ListFooterComponent={() => (<ActivityIndicator size='small' color='#fff' animating={loadingMore}/>)}
      ListEmptyComponent={() => ( <View style={{justifyContent:'center',alignItems:'center',flex:1,marginTop:20}}>
        <Text
        variant='titleLarge'
        style={{
          color:theme.colors.tertiary
        }}>Send a new message!</Text>
        </View>)}
      renderItem={({item}) => (
        <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
            <ChatList currentUser={user} otherusers={users}/>
        </Suspense>
      )}
      />
      </View>
  </View>
  )
}


const styles = StyleSheet.create({
    screen:{
      flex:1,
    },
})
export default MessageScreen
