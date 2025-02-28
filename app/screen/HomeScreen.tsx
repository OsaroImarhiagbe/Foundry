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
  useWindowDimensions,
  ScrollView,
  Animated,
  useColorScheme
} from 'react-native'
import color from '../../config/color';
import { useNavigation} from '@react-navigation/native';
import { useAuth } from 'app/authContext';
import { collection,FirebaseFirestoreTypes,onSnapshot,doc,orderBy,query, limit,getDocs, startAfter } from '@react-native-firebase/firestore';
import { useDispatch} from 'react-redux';
import { addId } from '../features/user/userSlice.ts';
import { FlashList } from "@shopify/flash-list";
import {ActivityIndicator,Text,Divider,useTheme} from 'react-native-paper'
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
//import crashlytics from '@react-native-firebase/crashlytics'
import { PostRef} from 'FIrebaseConfig.ts';

const PostComponent = lazy(() => import('../components/PostComponent'))


const Spacer = ({ height = 16 }) => <View style={{ height }} />;

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

// const Post = () => (
//   <ScrollView scrollEnabled style={{flex:1,backgroundColor:color.backgroundcolor}}>
//     <View style={{flex:1,backgroundColor:color.backgroundcolor}}>
//       <Text>hi</Text>
//   </View>
//   </ScrollView>
  
// ); 

const HomeScreen = () => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {user} = useAuth()
  const {height, width} = useWindowDimensions();
  const [post, setPost] = useState<Post[]>([])
  const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [category,setCategory] = useState('')
  const [mount, setMount] = useState<boolean>(false)
  const scrollY = useState(new Animated.Value(0))[0];
  const dark_or_light = useColorScheme()


  const memoPost = useMemo(() => {
    return post?.filter((name) => name?.category?.includes('Creativity and Innovation'));
  }, [post]);
  
  // const headerOpacity = scrollY.interpolate({
  //   inputRange: [0, 250],
  //   outputRange: [1, 0],
  //   extrapolate: 'clamp',
  // });
  // const headerBackgroundColor = scrollY.interpolate({
  //   inputRange: [0, 250],
  //   outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0,0,0)'], // Adjust the color
  //   extrapolate: 'clamp',
  // });

  useEffect(() => {
    if (!user?.userId) return;
    setMount(true)
    dispatch(addId({currentuserID:user?.userId}))
    const timer = setTimeout(() => {
      //crashlytics().log('Grabbing post')
        try {
          const docRef = query(PostRef,orderBy('createdAt', 'desc'),limit(10))
          const subscriber = onSnapshot(docRef,querySnapShot =>{
              if (!querySnapShot || querySnapShot.empty) {
                setPost([]);
                return;
              }
              let data:Post[] = []; 
              querySnapShot.forEach(documentSnapShot => {
                data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
            } )
            setPost(data);
            setLastVisible(querySnapShot.docs[querySnapShot.docs.length - 1]);
            setHasMore(querySnapShot.docs.length > 0);
          });
          return () => subscriber()
        }  catch (error:any) {
          //crashlytics().recordError(error)
        console.error(`Error post can not be found: ${error}`);
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
    //crashlytics().log('Post Refresh')
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
        });
        return () => unsub()
      }  catch (error:any) {
        //crashlytics().recordError(error)
        console.error(`Error post can not be found: ${error}`);
    }finally{
      setRefreshing(false);
    }
  }, [memoPost]);
  

  
  

const fetchMorePost = async () => {
  //crashlytics().log('Fetch More Post')
  if (loadingMore || !hasMore) return;
  if (!user?.userId) return;
  if (post.length <= 2) {
    setHasMore(false);
    return;
  }
  setLoadingMore(true);
  try {
    const docRef = lastVisible ? query(
      PostRef,
      orderBy('createAt','desc'),
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
  } catch (error:any) {
    //crashlytics().recordError(error)
    console.error(`Error fetching more posts: ${error}`);
  } finally {
    setLoadingMore(false);
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
    animate={{ backgroundColor: dark_or_light ? '#ffffff' : '#000000' }}
  >
    <Skeleton colorMode={dark_or_light ? 'light':'dark'} radius="round" height={hp(4.3)}/>
    <Spacer height={8}/>
    <Skeleton height={'100%'} colorMode={dark_or_light ? 'light':'dark'} width={'100%'} radius='square'/>
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
        <ActivityIndicator color={theme.colors.background ? '#000' :'#fff'} size='large' animating={mount}/>
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
