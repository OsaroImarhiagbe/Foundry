import React,
{
  useEffect,
  useState,
  useCallback,
  useRef
}from 'react'
import {
    View,
    } from 'react-native'
import { useAuth } from '../authContext';
import {ActivityIndicator,Divider,Text,useTheme} from 'react-native-paper';
import {ref,FirebaseDatabaseTypes, orderByChild, startAt, query,onValue, limitToLast, onChildAdded, limitToFirst} from '@react-native-firebase/database';
import {log,recordError,} from '@react-native-firebase/crashlytics'
import { FlashList } from '@shopify/flash-list';
import { crashlytics, perf, database,} from '../../FirebaseConfig';
import PostComponent from '../components/PostComponent';
import { TimeAgo } from '../../utils/index';
import Toast from 'react-native-toast-message'
import {  useSafeAreaInsets } from 'react-native-safe-area-context';






interface Post{
    id: string;
    auth_profile?: string;
    like_count?: number;
    imageUrl?: string;
    post_id?: string;
    name?: string;
    content?: string;
    createdAt?:number;
    comment_count?: number;
    mount?:boolean,
    videoUrl?:string,};
  

const FeedScreen = () => {
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const {user} = useAuth()
    const [post, setPost] = useState<Post[]>([])
    const [lastVisible, setLastVisible] = useState<FirebaseDatabaseTypes.DataSnapshot | null>(null);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true)
    const theme = useTheme()
    const {top} = useSafeAreaInsets()
    const isMountRef = useRef(false)





    useEffect(() => {
      Toast.show({
        type: 'success',
        text1: `Welcome Back ${user.username}`,
        position:'top',
        autoHide:true,
        visibilityTime:5000,
        topOffset:top,
      })
    },[])
  
   
 
    useEffect(() => {
      if (!user?.userId) return;
      log(crashlytics,'Grabbing post')
        try {
          const postRef = ref(database,'/posts')
          const orderedQuery = query(postRef,orderByChild('createdAt'),limitToFirst(10))
          const subscriber = onValue(orderedQuery,(snapshot: FirebaseDatabaseTypes.DataSnapshot) =>{
              if (!snapshot.exists()) {
                setPost([]);
                setLoading(false);
                return;
              }
              
              const data: Post[] = [];
              Object.keys(snapshot.val()).forEach((key) => {
                data.push({ ...snapshot.val()[key], id:key });
              });
            setPost(data);
            const lastPost = data[data.length - 1];
            setLastVisible(snapshot.child(lastPost.id?.toString() || ''));
            setHasMore(snapshot.val().length > 0);
            setLoading(false);
          },(error:unknown | any) => {
            recordError(crashlytics, error);
            console.error(`Error in snapshot listener Feed Screen: ${error}`);
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
    }, []); 
  

    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      let trace = await perf.startTrace('refreshing_post_feedscreen')
      log(crashlytics,'Post Refresh')
    
        try {
          const docRef = ref(database,'/posts')
          const orderedQuery = query(docRef,orderByChild('createdAt'),limitToLast(5))
          const subscriber = onValue(orderedQuery,(snapshot:FirebaseDatabaseTypes.DataSnapshot) =>{
            if(!snapshot.exists()){
              setPost([])
              setRefreshing(false)
              return;
            }
            const data:Post[] = []
            Object.keys(snapshot.val()).forEach((key) => {
              data.push({...snapshot.val()[key],id:key})
            })
            setPost(data);
            const lastPost = data[data.length - 1];
            setLastVisible(snapshot.child(lastPost.createdAt?.toString() || ''));
            setHasMore(data.length > 0);
            trace.putAttribute('post_count', post.length.toString());
            setRefreshing(false)
          });
          return () => subscriber()
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
      setLoadingMore(true)
      log(crashlytics,'Fetch More Post')
      let trace = await perf.startTrace('fetching_more_post_feedscreen')
      if (!lastVisible || !hasMore) return;
      try {
        const docRef = ref(database,'/posts')
        const orderedQuery = query(docRef,orderByChild('createdAt'),startAt(lastVisible.val().createdAt),limitToLast(5))
        const subscriber = onValue(orderedQuery,(snapshot:FirebaseDatabaseTypes.DataSnapshot) => {
          if(!snapshot.exists()){
            setHasMore(false)
            setLoadingMore(false)
            return;
          }
        const data:Post[] = []
        Object.keys(snapshot.val()).forEach((key) => {
          data.push({...snapshot.val()[key],id:key})
          return true
        })
        setPost((prev) => [...prev,...data]);
        const lastPost = data[data.length - 1];
        setLastVisible(snapshot.child(lastPost.id?.toString() || ''));
        setHasMore(data.length > 0);
        trace.putAttribute('post_count', post.length.toString());
        setLoadingMore(false);
        })
        return () => subscriber()
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
              onEndReachedThreshold={0.5}
              refreshing={refreshing}
              ItemSeparatorComponent={()=> (
                <Divider/>
              )}
              ListFooterComponent={() => (
                  <ActivityIndicator color='#fff' size='small' animating={false}/>
              )}
              keyExtractor={(item) => item?.post_id?.toString() || `default-${item.id}`}
              renderItem={({item}) =>
             <PostComponent
                  auth_profile={item.auth_profile}
                  like_count={item.like_count}
                  url={item.imageUrl}
                  video={item.videoUrl}
                  post_id={item.post_id}
                  name={item.name}
                  content={item.content}
                  date={TimeAgo(item?.createdAt ?? 0)}
                  comment_count={item.comment_count}/>}/>
                )}
    </View>
  )
}


export default FeedScreen

