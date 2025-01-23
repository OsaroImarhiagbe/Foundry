import React,{
  useState,
  useEffect,
  lazy,
  Suspense,
  useMemo,
  useCallback} from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  StatusBar,
  SafeAreaView,
  Animated
} from 'react-native'
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';;
import { useAuth } from '../authContext';
import firestore from '@react-native-firebase/firestore'
import { useDispatch} from 'react-redux';
import { addId } from '../features/user/userSlice';
//import PushNotification from '../components/PushNotifications.js';
import { FlashList } from "@shopify/flash-list";
import {ActivityIndicator,Text,Divider} from 'react-native-paper'
const PostComponent = lazy(() => import('../components/PostComponent.js'))





const HomeScreen = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useAuth()
  const {height, width} = useWindowDimensions();
  const [post, setPost] = useState([])
  const [lastVisible,setLastVisible] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mount, setMount] = useState(false)
  const scrollY = useState(new Animated.Value(0))[0];

  2
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (!user?.userId) return;
    setMount(true)
    dispatch(addId({currentuserID:user?.userId}))
    const timer = setTimeout(() => {
        try {
          const subscriber = firestore().collection('posts').orderBy('createdAt', 'desc').limit(10)
            .onSnapshot(querySnapShot =>{
              if (!querySnapShot || querySnapShot.empty) {
                setPost([]);
                return;
              }
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
          setPost(data);
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
  const handlePress = () => {
    navigation.openDrawer();
  }
  const handleMessage = () => {
    navigation.navigate('Message')
  }
  return (
    <SafeAreaView
    style={styles.screen}
    >
      {/* <PushNotification/> */}
      <Animated.View style={{ opacity: headerOpacity}}>
          <ChatRoomHeader
          onPress={handlePress}
          title='DevGuiide'
          icon='menu'
          iconColor='#00bf63'
          icon2='new-message'
          onPress2={handleMessage}
          backgroundColor={color.button}
          />
        <View style={styles.link}>
          <TouchableOpacity onPress={() => console.log('text pressed')}>
          <Text
          varaiant='titleSmall'
          style={{color:'#fff'}}>Resources</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text pressed')}>
          <Text
          variant='titleSmall'
          style={{color:'#fff'}}
          >Community</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text pressed')}>
          <Text
           variant='titleSmall'
           style={{color:'#fff'}}
           >Code</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('test pressed')}>
          <Text
           variant='titleSmall'
           style={{color:'#fff'}}
           >Learning Path</Text></TouchableOpacity>
        </View>
        </Animated.View>
   {mount ? Array.from({length:5}).map((_,index) => (
    <PostComponent key={index} mount={mount}/>
   ))
   : <FlashList
    contentContainerStyle={{paddingBottom:30,padding:0}}
    data={memoPost}
    estimatedItemSize={402}
    onRefresh={onRefresh}
    onScroll={Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false }
    )}
    onEndReached={fetchMorePost}
    onEndReachedThreshold={0.1}
    refreshing={refreshing}
    ItemSeparatorComponent={()=> (
      <Divider/>
    )}
    ListFooterComponent={() => (
       <ActivityIndicator color='#fff' size='small' animating={loadingMore}/>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  bodyText:{
    fontSize:15
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
    screen:{
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      flex:1,
      backgroundColor:'#121212'
  },
  title:{
    textAlign:'center',
    color:color.white,
    fontSize:20,
    marginLeft:40
  },
})

export default HomeScreen
