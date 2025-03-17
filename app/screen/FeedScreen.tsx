import React,
{
  useEffect,
  useState,
  lazy,
  useCallback,
  useRef,
}from 'react'
import {
    View,
    StyleSheet,
    useColorScheme,} from 'react-native'

import { useAuth } from '../authContext';
import {ActivityIndicator,Divider,Text,useTheme} from 'react-native-paper';
import { FirebaseFirestoreTypes, getDocs, limit, onSnapshot, orderBy, query, startAfter, Unsubscribe} from '@react-native-firebase/firestore';
import {log,recordError,} from '@react-native-firebase/crashlytics'
import { FlashList } from '@shopify/flash-list';
import { crashlytics, perf, PostRef } from '../../FirebaseConfig';
import { addId } from 'app/features/user/userSlice';
import { useDispatch } from 'react-redux';
import { FirebasePerformanceTypes } from '@react-native-firebase/perf';
import PostComponent from '../components/PostComponent';








interface Post{
    id: string;
    auth_profile?: string;
    like_count?: number;
    imageUrl?: string;
    post_id?: string;
    name?: string;
    content?: string;
    createdAt?: FirebaseFirestoreTypes.Timestamp
    comment_count?: number;
    mount?:boolean
  };
  

const FeedScreen = () => {
    const dispatch = useDispatch()
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const {user} = useAuth()
    const [post, setPost] = useState<Post[]>([])
    const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false)
    const theme = useTheme()

 
    useEffect(() => {
      setLoading(true)
      if (!user?.userId) return;
      dispatch(addId({currentuserID:user?.userId}))
      log(crashlytics,'Grabbing post')
      let trace: FirebasePerformanceTypes.Trace;
        try {
          const docRef = query(PostRef,orderBy('createdAt', 'desc'),limit(10))
          const subscriber = onSnapshot(docRef,async (querySnapShot) =>{
            trace = await perf.startTrace('feedscreen')
              if (!querySnapShot || querySnapShot.empty) {
                setPost([]);
                setLoading(false);
                return;
              }
              let data:Post[] = []; 
              querySnapShot.forEach(documentSnapShot => {
                data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
            } )
            setPost(data);
            setLastVisible(querySnapShot.docs[querySnapShot.docs.length - 1]);
            setHasMore(querySnapShot.docs.length > 0);
            setLoading(false);
          },error => {
            recordError(crashlytics, error);
            console.error(`Error in snapshot listener: ${error}`);
            setLoading(false);
          });
          return () => subscriber()
        }catch (error:unknown | any) {
          recordError(crashlytics,error)
          console.error(`Error post can not be found: ${error}`);
          setLoading(false);
      }finally{
        setLoading(false)
      }
    return () => { 
      if(trace) { 
        trace.stop()
      }}
    }, []); 
  
  
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      let trace = await perf.startTrace('refreshing_post_feedscreen')
      log(crashlytics,'Post Refresh')
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
          setRefreshing(false)
      }finally{
        setRefreshing(false);
        trace.stop()
      }
    }, []);

    const fetchMorePost = useCallback(async () => {
      log(crashlytics,'Fetch More Post')
      let trace = await perf.startTrace('fetching_more_post_feedscreen')
      if (!loadingMore || !hasMore) return;
      if (!user?.userId) return;
      if (post.length <= 2) {
        setHasMore(false);
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
    },[post, lastVisible, hasMore, loadingMore]);

  return (
      <View style={{flex:1,backgroundColor:theme.colors.background}}>
          <FlashList
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
              <ActivityIndicator color='#fff' size='small' animating={loadingMore}/>
          )}
          renderItem={({item}) => 
            <PostComponent
            auth_profile={item.auth_profile}
            count={item.like_count}
            url={item.imageUrl}
            id={item.post_id}
            name={item.name}
            content={item.content}
            mount={refreshing}
            date={item?.createdAt?.toDate().toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true})}
            comment_count={item.comment_count}/>
            }
          keyExtractor={(item)=> item?.post_id?.toString() || Math.random().toString()}
          />
              </View>
  )
}


const styles = StyleSheet.create({
    logo: {
        width: 40,
        height: 40, 
    },
    icon:{
      margin:5
    },
    padded: {
      padding: 16,
    },
    container:{
      flex:1
    }
});

export default FeedScreen

