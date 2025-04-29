import React,{
  useState,
  useEffect,
  useCallback,
  useMemo,} from 'react'
import {
  View,
} from 'react-native'
import { useAuth } from '../../Context/authContext';
import { useSelector} from 'react-redux';
import { FlashList } from "@shopify/flash-list";
import {ActivityIndicator,Text,Divider,useTheme} from 'react-native-paper'
import {log,recordError} from '@react-native-firebase/crashlytics'
import { crashlytics,perf,database} from '../../FirebaseConfig';
import {ref,FirebaseDatabaseTypes, orderByChild, limitToFirst, startAt, query, equalTo, onValue, limitToLast, } from '@react-native-firebase/database';
import PostComponent from '../../components/FeedComponents/PostComponent';
import { TimeAgo } from '../../../utils/index';




type Post = {
  key?:string,
  id?: string;
  auth_profile?: string;
  like_count?: number;
  imageUrl?: string;
  post_id?: string;
  name?: string;
  content?: string;
  category?:string;
  createdAt?: number;
  comment_count?: number;
  mount?:boolean,
  videoUrl?:string,
};


const HomeScreen= () => {
  const theme = useTheme()
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {user} = useAuth()
  const [post, setPost] = useState<Post[]>([])
  const [lastVisible, setLastVisible] = useState<Post[]>([]);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const category = useSelector((state: { search: { searchID: string } }) => state.search.searchID)

  const memoPost = useMemo(() => {
    return post.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
  },[post])
  useEffect(() => {
    log(crashlytics,'Grabbing post')
    if (!category) {
      setPost([]);
      setLoading(false);
      return;
    }
      try {
        const docRef = ref(database,'/posts')
        const orderedQuery = query(docRef,orderByChild('category'),equalTo(category),limitToLast(10))
        const subscriber = onValue(orderedQuery,(snapshot:FirebaseDatabaseTypes.DataSnapshot) =>{
          if (!snapshot.exists()) {
            setPost([]);
            setLoading(false);
            return;
          }
          const data:Post[] = []; 
          Object.keys(snapshot.val()).forEach(key => {
            data.push({ ...snapshot.val()[key],id:key });
            setLastVisible([{key: key}]);
          })
          setPost(data);
          setHasMore(data.length > 0);
          setLoading(false);
        });
          return () => subscriber()
        } catch (error:unknown | any) {
          recordError(crashlytics,error)
          console.error(`Error post can not be found: ${error}`);
          setLoading(false);
        }finally{
          setLoading(false)
        }
  }, [category]); 

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    log(crashlytics,'Post Refresh')
    const trace = await perf.startTrace('Refreshing_community_posts_HomeScreen')
    try {
      const docRef = ref(database,'/posts')
      const orderedQuery = query(docRef,orderByChild('createdAt'),equalTo(category),limitToLast(5))
      const subscriber = onValue(orderedQuery,(snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
        if(!snapshot.exists()){
          setPost([])
          setRefreshing(false)
          return;
        }
        const data:Post[] = []
        Object.keys(snapshot).forEach((key) => {
          data.push({...snapshot.val()[key],id:key})
          setLastVisible([{key: key}]);
        })
        setPost(data);
        setHasMore(data.length > 0);
        trace.putAttribute('post_count', post.length.toString());
        setRefreshing(false)
      })
      return () => subscriber()
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
  if (!lastVisible || !hasMore) return;
  try {
    const docRef = ref(database,'/posts')
    const orderedQuery = query(docRef,orderByChild('category'),equalTo(category),startAt(lastVisible[0].key),limitToFirst(5))
    const subscriber = onValue(orderedQuery,(snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
      if(!snapshot.exists()){
        setPost([])
        setLoadingMore(false)
        return;
      }
      const morePost:Post[] = []
      Object.keys(snapshot).forEach((key) => {
        morePost.push({...snapshot.val()[key],id:key})
        setLastVisible([{key: key}]);
      })
    setPost(prev => [...prev, ...morePost]);
    setHasMore(morePost.length > 0 );
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
},[loadingMore,hasMore,post,category,lastVisible])

  return (
    <View
    style={{flex:1,backgroundColor:theme.colors.background}}
    >
     <FlashList
        contentContainerStyle={{padding:0}}
        data={memoPost}
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
          like_count={item.like_count}
          url={item.imageUrl}
          post_id={item.post_id}
          video={item.videoUrl}
          name={item.name}
          content={item.content}
          date={TimeAgo(item?.createdAt ?? 0)}
          comment_count={item.comment_count}/>
         }
        keyExtractor={(item,index)=> item?.post_id?.toString() || `default-${index}`}
        />
    </View>
  )
}


export default HomeScreen
