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
  SafeAreaView} from 'react-native'
import color from '../../config/color';
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator,Text } from 'react-native-paper';
const ChatList = lazy(() => import('../../List/ChatList'))


const MessageScreen = () => {


  const [users, setUsers] = useState([]);
  const navigation = useNavigation();
  const { user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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
 
  const fetchMorePost = async () => {
    if (loadingMore || !hasMore) return;
    if (!user?.userId) return;
    if (post.length <= 2) {
      setHasMore(false);
      return;
    }
    setLoadingMore(true);
    try {
      const snapshot = await firestore()
        .collection('posts')
        .orderBy('createdAt', 'desc')
        .startAfter(lastVisible)
        .limit(2)
        .get();
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPost(prevPosts => [...prevPosts, ...newPosts]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length > 0);
    } catch (e) {
      console.error(`Error fetching more posts: ${e}`);
    } finally {
      setLoadingMore(false);
    }
  }


  return (
    <SafeAreaView style={styles.screen}>
      <ChatRoomHeader title='Message' onPress={handlePress} icon='keyboard-backspace' backgroundColor={color.button} iconColor='#00bf63'/>
      <View style={{marginTop:5}}>
      <FlashList
      onRefresh={onRefresh}
      data={users}
      refreshing={refreshing}
      onEndReached={fetchMorePost}
      onEndReachedThreshold={0.1}
      ListFooterComponent={() => (<ActivityIndicator size='small' color='#fff' animating={loadingMore}/>)}
      ListEmptyComponent={() => ( <View style={{justifyContent:'center',alignItems:'center',flex:1,marginTop:40}}>
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
  </SafeAreaView>
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
