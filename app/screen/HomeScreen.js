import React,{useState,useEffect,lazy, Suspense,useMemo,useCallback} from 'react'
import {View, Text, StyleSheet,TouchableOpacity, FlatList, Platform,StatusBar, ActivityIndicator,Image} from 'react-native'
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';;
import { useAuth } from '../authContext';
import firestore from '@react-native-firebase/firestore'
import { useDispatch} from 'react-redux';
import { addId } from '../features/user/userSlice';
import PushNotification from '../components/PushNotifications.js';
const PostComponent = lazy(() => import('../components/PostComponent.js'))





const HomeScreen = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useAuth()
  const [post, setPost] = useState([])
  const [lastVisible,setLastVisible] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mount, setMount] = useState(false)

  useEffect(() => {
    if (!user?.userId) return;
    setMount(true)
    dispatch(addId({currentuserID:user?.userId}))
    const timer = setTimeout(() => {
        try {
          const subscriber = firestore().collection('posts').orderBy('createdAt', 'desc').limit(10)
            .onSnapshot(querySnapShot =>{
              let data = [];
              querySnapShot.forEach(documentSnapShot => {
                data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
            } )
            setPost([...data]);
            setLastVisible(querySnapShot.docs[querySnapShot.docs.length - 1]);
            setHasMore(querySnapShot.docs.length > 0);
          });
          return () => subscriber()
        }  catch (e) {
        console.error(`Error post can not be found: ${e}`);
      }finally{
        setMount(false)
      } 
    },3000)
      
    return () => {
      clearTimeout(timer);
    };
  }, []); 


  const onRefresh = useCallback(() => {
    setRefreshing(true);
      try {
        const unsub = firestore().collection('posts').orderBy('createdAt', 'desc').limit(10)
          .onSnapshot(querySnapShot =>{
            let data = [];
            querySnapShot.forEach(documentSnapShot => {
              data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
          } )
          setPost([...data]);
          setLastVisible(querySnapShot.docs[querySnapShot.docs.length - 1]);
          setHasMore(querySnapShot.docs.length > 0);
        });
        return () => unsub()
      }  catch (e) {
      console.error(`Error post can not be found: ${e}`);
    }finally{
      setRefreshing(false);
    }
  }, [memoPost]);
  

  const memoPost = useMemo(() => {return post},[post])
  

const fetchMorePost = async () => {
  if (loadingMore || !hasMore) return;
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
  const handlePress = () => {
    navigation.openDrawer();
  }
  const handleMessage = () => {
    navigation.navigate('Message')
  }
  return (
    <View
    style={styles.screen}
    >
      <PushNotification/>
        <View>
          <ChatRoomHeader
          onPress={handlePress}
          title='DevGuiide'
          icon='menu'
          icon2='new-message'
          onPress2={handleMessage}
          backgroundColor={color.button}
          />
        </View>
        <View style={styles.link}>
          <TouchableOpacity onPress={() => console.log('text pressed')}><Text style={styles.linkText}>Resources</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text pressed')}><Text style={styles.linkText}>Community</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text pressed')}><Text style={styles.linkText}>Code</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('test pressed')}><Text style={styles.linkText}>Learning Path</Text></TouchableOpacity>
        </View>
   {mount ? Array.from({length:5}).map((_,index) => (
    <PostComponent key={index} mount={mount}/>
   ))
   : <FlatList
    data={memoPost}
    onRefresh={onRefresh}
    onEndReached={fetchMorePost}
    onEndReachedThreshold={0.5}
    refreshing={refreshing}
    ListFooterComponent={() => (
      <ActivityIndicator color='#fff' size='small'/>
    )}
    renderItem={({item}) => <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <PostComponent
      auth_profile={item.auth_profile}
      count={item.like_count}
      url={item.imageUrl}
      id={item.post_id}
      name={item.name}
      content={item.content}
      date={item.createdAt.toDate().toLocaleString()}
      comment_count={item.comment_count}/>
      </Suspense>}
    keyExtractor={(item)=> item.post_id}
    /> } 
    </View>
  )
}

const styles = StyleSheet.create({
  bodyText:{
    fontSize:15
  },
    imagecontainer:{
      width:50,
      height:50,
      marginRight:20
    },
    link:{
      marginVertical:10,
      flexDirection:'row',
      justifyContent:'space-evenly',
      padding:5
    },
    messageContainer:{
      marginLeft:40
    },
    linkText:{
      textAlign:'center',
      color:'#ffffff',
      fontSize:15,
      fontFamily:'Helvetica-light'
    },
    screen:{
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      flex:1,
      backgroundColor:'#1f1f1f'
  },
  title:{
    fontWeight:'bold',
    textAlign:'center',
    color:color.white,
    fontSize:20,
    marginLeft:40
  },
})

export default HomeScreen
