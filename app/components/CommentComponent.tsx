import React,{useState,useEffect,memo, useCallback} from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ReplyComponent from './ReplyComponent';
import { useSelector } from 'react-redux';
import {Text,Card,useTheme, ActivityIndicator} from 'react-native-paper'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import FastImage from '@d11/react-native-fast-image';
import { crashlytics, database, functions } from '../../FirebaseConfig';
import {endBefore, FirebaseDatabaseTypes, limitToLast, onValue, orderByChild, query, ref} from '@react-native-firebase/database'
import { log, recordError } from '@react-native-firebase/crashlytics';
import { FlashList } from '@shopify/flash-list';
import { httpsCallable } from '@react-native-firebase/functions';
import { TimeAgo } from '../../utils/index';

type CommentProp = {
  content?:string,
  name?:string | any,
  comment_id?:string | any,
  post_id?:string,
  date?:string,
  comment_count?: number
  auth_profile?:string,
  like_count?:number,
  liked_by?: string[]
  onReplyPress: (comment_id: string, name: string) => void;
  url?:string;
}

interface Reply{
  reply_id?:string,
  auth_profile?:string,
  like_count?:number,
  content?:string,
  name?:string,
  createdAt?:number

}
const CommentComponent:React.FC<CommentProp> = memo(({
  content,
  name,
  comment_id,
  post_id,
  comment_count,
  like_count,
  date,
  auth_profile,
  url,
  onReplyPress}) => {
    const [press,setIsPress] = useState(false)
    const [isloading,setLoading] = useState<boolean>(true)
    const [showReply,setShowReply] = useState<boolean>(false)
    const [lastVisible, setLastVisible] = useState<FirebaseDatabaseTypes.DataSnapshot | null>(null);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [reply,setReply] = useState<Reply[]>([])
    const {user} = useAuth();
    const profileImage = useSelector((state:any) => state.user.profileImage)
    const theme = useTheme()


  
    useEffect(() => {
      log(crashlytics,'Fetching replies')
      const fetchReply = () => {
        try {
          const docRef = ref(database,`/replies/${comment_id}`)
          const queryOrderBy = query(docRef,orderByChild('createdAt'),limitToLast(5))
          const unsub = onValue(queryOrderBy,(snapshot)=>{
            if(!snapshot.exists()){
              setReply([])
              setLoading(false)
              return;
            }
            const data:Reply[] = [];
            snapshot.forEach(snapshot => {
              data.push({ ...snapshot.val(),id:snapshot.key});
              return true;
            })
            setReply(data);
            setLastVisible(data.length > 0 ? snapshot.child(data[data.length - 1].createdAt?.toString() || '') : null);
            setHasMore(data.length === 5)
            setLoading(false)
          })
          return () => unsub()
        }  catch (error: unknown | any) {
          recordError(crashlytics,error)
          console.error(`Error: ${error}`);
      }finally{
        setLoading(false)
      }
    };

    fetchReply()
    },[comment_id,post_id])



    const LoadMoreReplies = useCallback(async () => {
      setLoadingMore(true)
      if (!lastVisible || !hasMore) return;
      const docRef = ref(database,`/replys/${comment_id}`)
      const queryOrderBy = query(docRef, orderByChild('createdAt'), endBefore(lastVisible?.val()?.createdAt), limitToLast(5))
      try{
        const subscriber = onValue(queryOrderBy,(snapshot) => {
          if(!snapshot.exists()){
            setHasMore(false)
            setLoadingMore(false)
            return;
          }
          const data:Reply[] = []
          snapshot.forEach((childSnapshot) => {
            data.push({...childSnapshot.val(),id:childSnapshot.key});
            return true
          })
          setReply((prev) => [...prev,...data])
          setLastVisible(data.length > 0 ? snapshot.child(data[data.length - 1].createdAt?.toString() || '') : null);
          setHasMore(data.length === 5)
          setLoadingMore(false)
      })
          return () => subscriber()
      }catch(error:unknown | any){
        recordError(crashlytics,error)
        setLoadingMore(false)
      }finally{
        setLoadingMore(false)
      }
  },[comment_id,lastVisible])

    const LikeButton = useCallback(async () => {
      setLoading(true)
      const handleLike = httpsCallable(functions,'handleLike')
      try{
        await handleLike({
          post_id:post_id,
          currentUser:user.userId,
          comment_id:comment_id
        }).catch((error) => recordError(crashlytics,error))
      }catch(err){
        console.error('error liking comment:',err)
      }finally{
        setLoading(false)
      }
  
    },[post_id,comment_id])

    const handleIsPress = useCallback(() => {
      setIsPress(prev => !prev)
    },[press])

    const handleShowReply = useCallback(() => {
      setShowReply(prev => !prev)
    },[press])

  return (
    <Card
    mode='contained'
    style={{backgroundColor:theme.colors.onSecondary}}
    >
    <Card.Content>
    <View style={{
      flexDirection:'row',
    }}>
     <View style={{flexDirection:'row',alignItems:'center'}}>
     <Image
        style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
        source={auth_profile}
        cachePolicy='none'
        placeholder={{blurhash}}/>
    <View>
     <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
     <Text
    variant='bodySmall'
    style={{
      marginLeft:10,
      color:theme.colors.onPrimary
    }}>{name}</Text>
      {url && 
      <FastImage
      source={{
        uri:url,
        priority: FastImage.priority.normal
      }}
      resizeMode={FastImage.resizeMode.contain}
      style={{
        aspectRatio:1,
        width:wp('100%'),
        height:hp('50%'),
        alignSelf: 'center',}}
      />}
     <View style={{paddingLeft:5}}>
      <Text
      variant='bodySmall'
      style={{
        fontSize:10,
        color:theme.colors.onPrimary
       }}>{date}</Text>
      </View> 
    </View> 
    <Text
    variant='bodySmall'
    style={{
      marginLeft:10,
      marginVertical:5,
      color:theme.colors.onPrimary
      }}>{content}
    </Text>
    </View>
    {
      reply && <TouchableWithoutFeedback onPress={handleShowReply} style={{marginLeft:150}}>
      <Text>View Replies</Text>
    </TouchableWithoutFeedback>
    }
      </View> 
    </View>
      <View style={styles.reactionContainer}>
    <TouchableHighlight
                 onShowUnderlay={handleIsPress}
                 onHideUnderlay={handleIsPress}
                 underlayColor='#0097b2'
                 onPress={LikeButton}
                 style={styles.reactionIcon}
                 >
                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <MaterialCommunityIcons name="heart" size={15} color={theme.colors.onTertiary}/>
                     <Text
                     variant='bodySmall'
                     style={styles.reactionText}>{like_count}</Text>
                 </View>
                 </TouchableHighlight>
        <TouchableOpacity onPress={() => {
          onReplyPress(comment_id, name)}}>
        <View style={styles.replycontainer}>
        <Text
        variant='bodySmall'
        style={styles.replies}>
              Reply</Text>
        </View>
      </TouchableOpacity>
      </View>
      <View>
      {showReply && 
      <FlashList
      ListFooterComponent={() => (
        <ActivityIndicator color='#fff' size='small' animating={loadingMore}/>)}
      onEndReached={LoadMoreReplies}
      onEndReachedThreshold={0.5}
      estimatedItemSize={460}
      data={reply}
      renderItem={({item}) => (
        <ReplyComponent
        key={item.reply_id}
        reply_id={item.reply_id}
        name={item.name}
        content={item.content}
        post_id={post_id} 
        comment_id={comment_id}
        date={TimeAgo(item.createdAt ?? 0)}
        count={item.like_count}/>
      )}
      />}
      </View>
    </Card.Content>
  </Card>
  )
})


const styles = StyleSheet.create({
    card:{
        marginTop:5,
    },
    reactionContainer:{
      flexDirection:'row',
      justifyContent:'space-around',
    },
    reactionIcon:{
      padding:5,
      width:100,
      flexDirection:'row',
      borderRadius:10,
    },
    reactionText:{
      color:'#fff',
      marginLeft:10,
      fontSize:10,
      textAlign:'center',
    },
    replies:{
      marginLeft:5,
      textAlign:'center'
    },
    replycontainer:{
      marginTop:5,
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'center'
      }
})

export default CommentComponent

