import React, {
  useState,
  useEffect,
  lazy,
  useCallback} from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity
  } from 'react-native'
import { useAuth } from '../authContext';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator,Text,useTheme,Icon } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {log,recordError} from '@react-native-firebase/crashlytics'
import { crashlytics, database} from '../FirebaseConfig';
import SearchComponent from 'app/components/SearchComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from 'moti/skeleton';
import { MotiView } from 'moti';
import LazyScreenComponent from '../components/LazyScreenComponent';
import { limitToFirst, onValue, orderByChild, ref, startAt, query } from '@react-native-firebase/database';
const ChatList = React.lazy(() => import('../../List/ChatList'))


interface Chats{
  key:string,
}

type NavigationProp = {
  Dash?:undefined
}

type Navigation = NativeStackNavigationProp<NavigationProp>
const MessageScreen = () => {


  const [chats, setChats] = useState<Chats[]>([]);
  const {top} = useSafeAreaInsets()
  const navigation = useNavigation<Navigation>();
  const { user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loading,setLoading] = useState<boolean>(true)
  const [lastVisible, setLastVisible] = useState<Chats[]>([]);
  const theme = useTheme()


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    log(crashlytics,'Grabbing Users Message')
    try{
        const chatRef = ref(database,`/chats`)
        const unsub = onValue(chatRef,(snapshot) =>{
          const data:Chats[] = []
          Object.keys(snapshot.val()).forEach(key => {
            data.push({...snapshot.val()[key], id: key})
          }) 
          setChats(data)
          setLastVisible([{key: data[data.length - 1].key}])
          setHasMore(data.length > 0)
          setRefreshing(false)
        })
        return () => unsub()
      }catch(error:any){
      recordError(crashlytics,error)
      setRefreshing(false)
    }finally{
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => {
    log(crashlytics,'Grabbing Users Message')
    try{
      const chatsRef = ref(database,`/chats`)
      const unsub = onValue(chatsRef,(snapshot) =>{
        if(!snapshot.exists()){
          setChats([])
          setLoading(false)
          return;
        }
        const data:Chats[] = []
        Object.keys(snapshot.val()).forEach(key => {
          data.push({...snapshot.val()[key],id:key})
        })
        setChats(data)
        setLastVisible([{ key: data[data.length - 1].key }])
        setHasMore(data.length > 0)
        setLoading(false)
      },(err)=>{
        recordError(crashlytics,err)
        console.error(`Failed to grab users: ${err.message}`)
        setLoading(false)
      })
      return () => unsub();
    }catch(error: unknown | any){
      recordError(crashlytics,error)
      console.error('Error getting messages',error)
      setLoading(false)
    }finally{
      setLoading(false)
    }
    },[])
  
  const fetchMoreMessage = async () => {
    setLoadingMore(true);
    log(crashlytics,'Fetch more Message')
    if (!hasMore) {
      setHasMore(false);
      setLoadingMore(false)
      return;
    }
    try {
      const chatsRef = ref(database,'/chats')
      const chatQuery = query(chatsRef,orderByChild('createdAt'),startAt(lastVisible[0].key),limitToFirst(5))
      const unsub = onValue(chatQuery,(snapshot) => {
        if(!snapshot.exists()){
          setChats([])
          setHasMore(false)
          setLoadingMore(false)
          return;
        }
        const morePost:Chats[] = []
        Object.keys(snapshot.val()).forEach((key) => {
          morePost.push({...snapshot.val()[key],id:key})
        })
        setChats(prev => [...prev, ...morePost]);
        setLastVisible([{key: morePost[morePost.length - 1].key}])
        setHasMore(false);
        setLoadingMore(false)
      })
      return () => unsub()
    } catch (error:unknown | any) {
      recordError(crashlytics,error)
      console.error(`Error fetching more posts: ${error}`);
      setLoadingMore(false)
    } finally {
      setLoadingMore(false);
    }
  }


  return (
    <View style={[styles.screen,{backgroundColor:theme.colors.background}]}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:top,padding:10}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon source='arrow-left-bold-circle' size={25}/>
        </TouchableOpacity>
        <SearchComponent title='Search Message...'/>
      <Icon source='dots-horizontal' size={25}/>
      <Icon source='message' size={25}/>
      </View>
      <View style={{marginTop:5,flex:1}}>
      <FlashList
      estimatedItemSize={460}
      onRefresh={onRefresh}
      data={chats}
      refreshing={refreshing}
      onEndReached={fetchMoreMessage}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() => (<ActivityIndicator size='small' color='#fff' animating={loadingMore}/>)}
      ListEmptyComponent={() => ( <View style={{justifyContent:'center',alignItems:'center',flex:1,marginTop:20}}>
        <Text
        variant='titleLarge'
        style={{
          color:theme.colors.tertiary
        }}>Send a new message!</Text>
        </View>)}
      renderItem={({item}) => (
        <LazyScreenComponent>
          <MotiView>
            <Skeleton>
            <ChatList currentUser={user} otherusers={chats}/>
            </Skeleton>
          </MotiView>
        </LazyScreenComponent>
      )}
      />
      </View>
  </View>
  )
}


const styles = StyleSheet.create({
    screen:{
      flex:1,
    },
})
export default MessageScreen
