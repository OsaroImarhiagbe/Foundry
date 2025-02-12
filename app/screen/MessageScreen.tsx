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
  } from 'react-native'
import color from '../../config/color';
import firestore,{FirebaseFirestoreTypes} from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator,Text,useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  const navigation = useNavigation<Navigation>();
  const { user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);
  const list_of_ids = useSelector((state:any)=> state.message.messagesID)
  const theme = useTheme()

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    grabUser(list_of_ids); 
    setRefreshing(false); 
  }, [list_of_ids]);

  useEffect(() => {
    let unsub:any;
    const fetchUser =  () => {
      unsub = grabUser(list_of_ids)
    }

    fetchUser()
    return () => {if(unsub) unsub()}
  },[list_of_ids])

  const grabUser = (list_of_ids:string[]) => {
    if (!list_of_ids || list_of_ids.length === 0) {
      setUsers([]);
      return;
    }
    const unsub = firestore()
    .collection('sent-message-id')
    .where('userId','!=',user.userId)
    .onSnapshot((documentSnapshot) =>{
      let data:User[] = []
      documentSnapshot.forEach(doc => {
        data.push({...doc.data()})
      })
      setUsers(data)
    },(err)=>{
      console.error(`Failed to grab users: ${err.message}`)
    })
    return unsub
  }
  
  const fetchMorePost = async () => {
    if (loadingMore || !hasMore) return;
    if (!user?.userId) return;
    if (users.length <= 2) {
      setHasMore(false);
      return;
    }
    setLoadingMore(true);
    try {
      const snapshot = await firestore()
        .collection('sent-message-id')
        .orderBy('createdAt', 'desc')
        .startAfter(lastVisible)
        .limit(2)
        .get();
      const newMessgae = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(prev => [...prev, ...newMessgae]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length > 0);
    } catch (e) {
      console.error(`Error fetching more posts: ${e}`);
    } finally {
      setLoadingMore(false);
    }
  }


  return (
    <View style={[styles.screen,{backgroundColor:theme.colors.background}]}>
      <ChatRoomHeader title='Message' onPress={() => navigation.navigate('Dash')} icon='keyboard-backspace' backgroundColor={color.button} iconColor='#00bf63'/>
      <View style={{marginTop:5,flex:1}}>
      <FlashList
      estimatedItemSize={460}
      onRefresh={onRefresh}
      data={users}
      refreshing={refreshing}
      onEndReached={fetchMorePost}
      onEndReachedThreshold={0.1}
      ListFooterComponent={() => (<ActivityIndicator size='small' color='#fff' animating={loadingMore}/>)}
      ListEmptyComponent={() => ( <View style={{justifyContent:'center',alignItems:'center',flex:1,marginTop:20}}>
        <Text
        variant='titleLarge'
        style={styles.text}>Send a new message!</Text>
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
      paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
      flex:1,
    },
    text:{
      color:'#fff',
      fontSize:20,
      fontFamily:'Helvetica-light'
      },
})
export default MessageScreen
