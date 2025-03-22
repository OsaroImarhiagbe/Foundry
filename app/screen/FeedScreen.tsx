import React,
{
  useEffect,
  useState,
  useCallback,
}from 'react'
import {
    View,
    } from 'react-native'

import { useAuth } from '../authContext';
import {ActivityIndicator,Divider,Text,useTheme} from 'react-native-paper';
import { FirebaseFirestoreTypes, getDocs, limit, onSnapshot, orderBy, query, startAfter, Unsubscribe} from '@react-native-firebase/firestore';
import {log,recordError,} from '@react-native-firebase/crashlytics'
import { FlashList } from '@shopify/flash-list';
import { crashlytics, perf, PostRef } from '../../FirebaseConfig';
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
    mount?:boolean,
    videoUrl?:string
  };
  

const FeedScreen = () => {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const {user} = useAuth()
    const [post, setPost] = useState<Post[]>([])
    const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true)
    const theme = useTheme()



  
    
 
    useEffect(() => {
      if (!user?.userId) return;
      log(crashlytics,'Grabbing post')
      const grabPost = async () => {
        const trace = await perf.startTrace('feedscreen')
        try {
          const docRef = query(PostRef,orderBy('createdAt', 'desc'),limit(10))
          const subscriber = onSnapshot(docRef,(querySnapShot) =>{
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
        trace.stop()
      }
      }
      grabPost()
    }, []); 
  

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      let trace = await perf.startTrace('refreshing_post_feedscreen')
      log(crashlytics,'Post Refresh')
        try {
          const docRef = query(PostRef,orderBy('createdAt', 'desc'),limit(10))
          const unsub = onSnapshot(docRef,querySnapShot =>{
            if(!querySnapShot || querySnapShot.empty){
              setPost([])
              setRefreshing(false)
              return;
            }
            let data:Post[] = [];
            querySnapShot.forEach(documentSnapShot => {
              data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
            })
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
      if (post.length <= 2) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }
      try {
        const docRef = query(
          PostRef,
          orderBy('createdAt','desc'),
          startAfter(lastVisible), 
          limit(2)) 
        const snapshot = await getDocs(docRef)
        if(!snapshot){
          setHasMore(false)
          setLoadingMore(false)
          return;
        }
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
        {
          loading ? Array.from({length:5}).map((_,index) => (
              <PostComponent
              key={index}
              mount={loading}
            />)) : (<FlashList
              contentContainerStyle={{padding:0}}
              data={post}
              showsVerticalScrollIndicator={false}
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
              keyExtractor={(item,index) => item?.post_id?.toString() || `defualt-${index}`}
              renderItem={({item}) =>
             <PostComponent
                  auth_profile={item.auth_profile}
                  count={item.like_count}
                  url={item.imageUrl}
                  video={item.videoUrl}
                  id={item.post_id}
                  name={item.name}
                  content={item.content}
                  date={item?.createdAt?.toDate().toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                  comment_count={item.comment_count}/>}/>
                )}
    </View>
  )
}


export default FeedScreen

