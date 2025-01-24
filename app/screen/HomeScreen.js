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
  ScrollView,
  Animated,
} from 'react-native'
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';;
import { useAuth } from '../authContext';
import firestore from '@react-native-firebase/firestore'
import { useDispatch} from 'react-redux';
import { addId } from '../features/user/userSlice';
import { FlashList } from "@shopify/flash-list";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {ActivityIndicator,Text,Divider,useTheme} from 'react-native-paper'
const PostComponent = lazy(() => import('../components/PostComponent.js'))


const Post = () => (
  <ScrollView
  scrollEnabled
   style={{flex:1,backgroundColor:color.backgroundcolor}}>
    <View style={{flex:1,backgroundColor:color.backgroundcolor}}>
      <Text>hi</Text>
  </View>
  </ScrollView>
  
); 
const Tab = createMaterialTopTabNavigator();


const HomeScreen = () => {

  const navigation = useNavigation();
  const theme = useTheme()
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


  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0,0,0)'], // Adjust the color
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
    <View
    style={[styles.screen,{backgroundColor:theme.colors.background}]}
    >
      
           <ChatRoomHeader
          onPress={handlePress}
          icon='menu'
          iconColor='#00bf63'
          icon2='new-message'
          onPress2={handleMessage}
          backgroundColor={color.button}
          /> 
        <View style={[styles.link,{borderBottomWidth:0.5,borderBottomColor:theme.colors.primary,backgroundColor:'transparent'}]}>
          <TouchableOpacity onPress={() => console.log('text pressed')}>
          <Text
           variant='titleMedium'
           style={{color:theme.colors.text}}
           >Resources</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text pressed')}>
          <Text
          variant='titleMedium'
          style={{color:theme.colors.text}}
          >Community</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text pressed')}>
          <Text
           variant='titleMedium'
           style={{color:theme.colors.text}}
           >Code</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('test pressed')}>
          <Text
           variant='titleMedium'
           style={{color:theme.colors.text}}
           >AI Assistant</Text></TouchableOpacity>
        </View>
   {mount ? Array.from({length:5}).map((_,index) => (
    <PostComponent key={index} mount={mount}/>
   ))
   : <FlashList
    contentContainerStyle={{padding:0}}
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
    </View>
  )
}

const styles = StyleSheet.create({
  bodyText:{
    fontSize:15
  },
  link:{
    flexDirection:'row',
    justifyContent:'space-evenly',
    },
    screen:{
      flex:1,
  },
})

export default HomeScreen
