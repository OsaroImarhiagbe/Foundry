import React,{
  useState,
  useEffect,
  useCallback,} from 'react'
import {
  View,
} from 'react-native'
import { useAuth } from 'app/authContext';
import { FirebaseFirestoreTypes,onSnapshot,doc,orderBy,query, limit,getDocs, startAfter,where } from '@react-native-firebase/firestore';
import { useSelector} from 'react-redux';
import { FlashList } from "@shopify/flash-list";
import {ActivityIndicator,Text,Divider,useTheme} from 'react-native-paper'
import {log,recordError} from '@react-native-firebase/crashlytics'
import { PostRef,crashlytics,perf} from '../../FirebaseConfig';
import PostComponent from '../components/PostComponent';




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
};


const HomeScreen= () => {
  const theme = useTheme()
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {user} = useAuth()
  const [post, setPost] = useState<Post[]>([])
  const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const category = useSelector((state:string | any)=> state.search.searchID)

  
  useEffect(() => {
    if (!user?.userId){
      setLoading(false)
      return;
    }
    log(crashlytics,'Grabbing post')
    const grabPost = async () => {
    const trace = await perf.startTrace('HomeScreen')
      try {
        const docRef = query(PostRef,where('category','==',category),orderBy('createdAt', 'desc'),limit(10))
        const subscriber = onSnapshot(docRef,(querySnapShot) =>{
          if (!querySnapShot || querySnapShot.empty) {
            setPost([]);
            setLoading(false);
            return;
          }
          let data:Post[] = []; 
          querySnapShot.forEach(documentSnapShot => {
            data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
          })
          setPost(data);
          setLastVisible(querySnapShot.docs[querySnapShot.docs.length - 1]);
          setHasMore(querySnapShot.docs.length > 0);
          setLoading(false);
        });
          return () => subscriber()
        } catch (error:unknown | any) {
          recordError(crashlytics,error)
          console.error(`Error post can not be found: ${error}`);
          setLoading(false);
        }finally{
          setLoading(false)
          trace.stop()
        }
      }
      grabPost()
  }, [category]); 



  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    log(crashlytics,'Post Refresh')
    const trace = await perf.startTrace('Refreshing_community_posts_HomeScreen')
    try {
      const docRef = query(PostRef,where('category','==',category),orderBy('createdAt', 'desc'),limit(10))
      const documentSnapShot = await getDocs(docRef)
        let data:Post[] = documentSnapShot.docs.map((doc) => ({
          ...doc.data(),
          id:doc.id,
        }))
        setPost(data);
        setLastVisible(documentSnapShot.docs[documentSnapShot.docs.length - 1]);
        setHasMore(documentSnapShot.docs.length > 0);
        trace.putAttribute('post_count', post.length.toString());
        setRefreshing(false)
      }  catch (error:any) {
        recordError(crashlytics,error)
        console.error(`Error post can not be found: ${error}`);
        setRefreshing(false);
      }finally{
        setRefreshing(false);
        trace.stop()
    }
  }, [category]);
    
  

const fetchMorePost = useCallback(async () => {
  setLoadingMore(true);
  log(crashlytics,'Fetch More Post')
  let trace = await perf.startTrace('fetch_more_community_posts')
  if (!hasMore) return;
  if (post.length <= 2) {
    setHasMore(false);
    setLoadingMore(false);
    return;
  }
  try {
    const docRef = query(
      PostRef,
      where('category','==',category),
      orderBy('createdAt','desc'),
      startAfter(lastVisible), 
      limit(2));
    const snapshot = await getDocs(docRef);
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
},[loadingMore,hasMore,post,category,lastVisible])

  return (
    <View
    style={{flex:1,backgroundColor:theme.colors.background}}
    >
      { loading ? Array.from({length:5}).map((_,index) => (
          <PostComponent
          key={index}
          mount={loading}
        /> )): (<FlashList
        contentContainerStyle={{padding:0}}
        data={post}
        estimatedItemSize={460}
        onRefresh={onRefresh}
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
           <ActivityIndicator color='#fff' size='small' animating={false}/>
        )}
        renderItem={({item}) => 
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
         }
        keyExtractor={(item)=> item?.post_id?.toString() || Math.random().toString()}
        />
      )
    }
    </View>
  )
}


export default HomeScreen
