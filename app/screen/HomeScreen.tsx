import React,{
  useState,
  useEffect,
  lazy,
  useMemo,
  useCallback,
  Suspense} from 'react'
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Animated,
  useColorScheme
} from 'react-native'
import { useAuth } from 'app/authContext';
import { FirebaseFirestoreTypes,onSnapshot,doc,orderBy,query, limit,getDocs, startAfter, Unsubscribe } from '@react-native-firebase/firestore';
import { useDispatch, useSelector} from 'react-redux';
import { addId } from '../features/user/userSlice.ts';
import { FlashList } from "@shopify/flash-list";
import {ActivityIndicator,Text,Divider,useTheme} from 'react-native-paper'
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {log,recordError} from '@react-native-firebase/crashlytics'
import { PostRef,crashlytics,perf} from '../../FirebaseConfig';
const PostComponent = lazy(() => import('../components/PostComponent'))


const Spacer = ({ height = 16 }) => <View style={{ height }} />;

console.log('HomeScreen renderd')
type Post = {

  id?: string;
  auth_profile?: string;
  like_count?: number;
  imageUrl?: string;
  post_id?: string;
  name?: string;
  content?: string;
  category?:string;
  createdAt?: FirebaseFirestoreTypes.Timestamp
  comment_count?: number;
  mount?:boolean
};


const HomeScreen= () => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {user} = useAuth()
  const {height, width} = useWindowDimensions();
  const [post, setPost] = useState<Post[]>([])
  const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [mount, setMount] = useState<boolean>(false)
  const scrollY = useState(new Animated.Value(0))[0];
  const dark_or_light = useColorScheme()
  const category = useSelector((state:string | any)=> state.search.searchID)

  
  

  const memoPost = useMemo(() => {
    return post?.filter((name) => name?.category?.includes(category));
  }, [post]);
 
  
  useEffect(() => {
    if (!user?.userId) return;
    let trace
    setMount(true)
    dispatch(addId({currentuserID:user?.userId}))
    let subscriber: Unsubscribe;
    log(crashlytics,'Grabbing post')
      try {
        const docRef = query(PostRef,orderBy('createdAt', 'desc'),limit(10))
        subscriber = onSnapshot(docRef,querySnapShot =>{
          if (!querySnapShot || querySnapShot.empty) {
            setPost([]);
            setMount(false);
            return;
          }
          let data:Post[] = []; 
          querySnapShot.forEach(documentSnapShot => {
            data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
          })
          setPost(data);
          setLastVisible(querySnapShot.docs[querySnapShot.docs.length - 1]);
          setHasMore(querySnapShot.docs.length > 0);
          setMount(false);
        });
      } catch (error:any) {
        recordError(crashlytics,error)
        console.error(`Error post can not be found: ${error}`);
        setMount(false);
      }
    return () => {
        if(subscriber){
          subscriber();
        }
      }
  }, []); 


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    log(crashlytics,'Post Refresh')
    let trace = await perf.startTrace('Refreshing_community_posts_HomeScreen')
      try {
        const docRef = query(PostRef,orderBy('createdAt', 'desc'),limit(10))
        const unsub = onSnapshot(docRef,querySnapShot =>{
            let data:Post[] = [];
            querySnapShot.forEach(documentSnapShot => {
              data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
          } )
          setPost(data);
          setLastVisible(querySnapShot.docs[querySnapShot.docs.length - 1]);
          setHasMore(querySnapShot.docs.length > 0);
          trace.putAttribute('post_count', post.length.toString());
          setRefreshing(false)
        });
        return () => unsub()
      }  catch (error:any) {
        recordError(crashlytics,error)
        console.error(`Error post can not be found: ${error}`);
        setRefreshing(false);
    }finally{
      setRefreshing(false);
      trace.stop()
    }
  }, [memoPost]);
    
  

const fetchMorePost = async () => {
  log(crashlytics,'Fetch More Post')
  let trace = await perf.startTrace('fetch_more_community_posts')
  if (loadingMore || !hasMore) return;
  if (post.length <= 2) {
    setHasMore(false);
    setLoadingMore(false);
    return;
  }
  setLoadingMore(true);
  try {
    const docRef = lastVisible ? query(
      PostRef,
      orderBy('createdAt','desc'),
      startAfter(lastVisible), 
      limit(2)) : 
      query(
        PostRef,
        orderBy('createdAt', 'desc'),
        limit(2))
    const snapshot = await getDocs(docRef)
    const newPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPost(prevPosts => [...prevPosts, ...newPosts]);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length > 0);
    trace.putAttribute('post_count', post.length.toString());
    setLoadingMore(false);
  } catch (error:any) {
    recordError(crashlytics,error)
    console.error(`Error fetching more posts: ${error}`);
    setLoadingMore(false);
  } finally {
    setLoadingMore(false);
    trace.stop()
  }
}



  return (
    <View
    style={[styles.screen,{backgroundColor:theme.colors.background}]}
    >
   {mount ? Array.from({length:5}).map((_,index) => (
    
    <MotiView
    key={index}
    transition={{
      delay:300
    }}
    style={[styles.container, styles.padded]}
    animate={{ backgroundColor: dark_or_light ? '#000000' : '#fffffff' }}
  >
    <Skeleton colorMode={dark_or_light ? 'dark':'light'} radius="round" height={hp(4.3)}/>
    <Spacer height={8}/>
    <Skeleton height={'100%'} colorMode={dark_or_light ? 'dark':'light'} width={'100%'} radius='square'/>
  </MotiView>
   ))
   : <FlashList
    contentContainerStyle={{padding:0}}
    data={memoPost}
    estimatedItemSize={460}
    onRefresh={onRefresh}
    onScroll={Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false }
    )}
    ListEmptyComponent={(item) => (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
        <Text>No post at the moment</Text>
      </View>
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
      date={item?.createdAt?.toDate().toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true})}
      comment_count={item.comment_count}/>
      </Suspense>}
    keyExtractor={(item)=> item?.post_id?.toString() || Math.random().toString()}
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
  padded: {
    padding: 10,
  },
  container:{
    flex:1
  }
})

export default HomeScreen
