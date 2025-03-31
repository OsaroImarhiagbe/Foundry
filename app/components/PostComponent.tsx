import React,{useState,useEffect,memo, useCallback, useRef} from 'react'
import {View,StyleSheet,
TouchableOpacity,
TouchableHighlight,
KeyboardAvoidingView,
Platform,
Modal,
Alert,
useColorScheme
} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CommentComponent from './CommentComponent';
import color from '../../config/color';
import Feather from 'react-native-vector-icons/Feather';
import { Card,Text,Divider,Icon} from 'react-native-paper';
import { FlashList } from "@shopify/flash-list";
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme,TextInput } from 'react-native-paper';
import {
  Menu,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MenuItems } from '../components/CustomMenu'
import { crashlytics, database, db, PostRef } from 'FirebaseConfig';
import FastImage from "@d11/react-native-fast-image";
import { perf } from '../../FirebaseConfig';
import { Skeleton } from 'moti/skeleton';
import { MotiView } from 'moti';
import Video, { VideoRef } from 'react-native-video';
import { functions } from '../../FirebaseConfig.ts';
import { httpsCallable } from '@react-native-firebase/functions'
import { recordError } from '@react-native-firebase/crashlytics';
import {ref,FirebaseDatabaseTypes, orderByChild, query,  onValue, } from '@react-native-firebase/database';
import { TimeAgo } from '../../utils/index';



interface PostComponentProps {
  auth_profile?: string;
  like_count?: number;
  url?: string;
  post_id?: string;
  name?: string;
  content?: string;
  date?: string;
  comment_count?: number;
  mount?: boolean;
  video?:string
}
interface Comment{
  comment_id?:string | any,
  auth_profile?:string,
  like_count?:number,
  comment_count?: number
  liked_by?: string[]
  content?:string,
  name?:string | any,
  createdAt?:number,
  parentId:string

}

const PostComponent: React.FC<PostComponentProps> = memo(({
  like_count,
  url,
  post_id,
  name,
  content,
  date,
  comment_count,
  mount,
  video
}) => {

 


    const [press,setIsPress] = useState<boolean>(false)
    const [isloading,setLoading] = useState<boolean>(true)
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [comments, setComment] = useState<Comment[]>([])
    const [text,setText] = useState('')
    const theme = useTheme()
    const {user} = useAuth();
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyingToUsername, setReplyingToUsername] = useState<string | undefined>(undefined);
    const videoRef = useRef<VideoRef>(null);
    const colorScheme = useColorScheme()

    const colorMode = colorScheme ? 'dark' : 'light'
 

    useEffect(() => {
      try{
        const docRef = ref(database,`/comments/${post_id}`)
        const q = query(docRef, orderByChild('createdAt'))
         const subscriber = onValue(q, (snapshot: FirebaseDatabaseTypes.DataSnapshot) => {
                if (!snapshot.exists()) {
                  setComment([]);
                  setLoading(false)
                  return;
                }
                let data:Comment[] = []
                snapshot.forEach(childSnapshot => {
                  data.push({ ...childSnapshot.val(),id:childSnapshot.key });
                  return true;
                })
                setComment(data)
                setLoading(false)
      }) 
            return () => subscriber()
      }catch(error:unknown | any){
        recordError(crashlytics,error)
        console.error('Error grabbing comments',error)
      }
    },[post_id])


 
    const LikeButton = useCallback(async () => {
      let trace = await perf.startTrace('post_like')
      try{
        const handleLike = httpsCallable(functions,"handleLike")
        await handleLike({
          post_id:post_id,
          currentUser: user.userId
        }).catch((error: unknown | any) => recordError(crashlytics, error))
        setLoading(false)
      }catch(err){
        console.error('error liking comment:',err)
        setLoading(false)
      }finally{
        setLoading(false)
        trace.stop()
      }
    },[post_id])

    const SendReplyorComment = useCallback(async () => {
      let trace = await perf.startTrace('post_send')
      const handleSend = httpsCallable(functions,'handleSend')
      try{
        await handleSend({
          post_id:post_id,
          name:user.username,
          content:text,
          auth_profile:user.profileUrl,
          comment_id: replyingTo,
          like_count: 0,
          comment_count: 0,
          liked_by: [],
        }).catch((error) => recordError(crashlytics,error))
        setText('');
        setReplyingTo(null);
        setReplyingToUsername(undefined);
        setLoading(false)
      }catch(error:unknown | any){
        recordError(crashlytics,error)
        setLoading(false)
      }finally{
        setLoading(false)
        trace.stop()
      }
  },[text,replyingTo,replyingToUsername,post_id])


    const handleDelete = useCallback(async () => {
      try {
        const messagesRef = ref(database,`/posts/${post_id}`)
        await messagesRef.remove()
        Alert.alert('Post Deleted!')
      } catch (error) {
        console.error('Error deleting document: ', error);

      }
    },[post_id])


    const handleModalVisibility = useCallback(() => {
      setModalVisible((prev) => !prev)
    },[modalVisible])

    const handleIsPress = useCallback(() => {
      setIsPress(prev => !prev)
    },[press])

 

  return (
  <Card
  elevation={2}
  style={{backgroundColor:'transparent',marginVertical:8,marginHorizontal:10}}
  >
  <Card.Content>
    <View style={{flexDirection:'row'}}>
      <MotiView
         transition={{
          type: 'timing',
        }}
        >
      <Skeleton
      colorMode={colorMode}
        show={mount}
        radius='round'
        >
      <Image
        style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
        source={require('../assets/user.png') || user.profileUrl}
        placeholder={{blurhash}}
        cachePolicy='none'/>
        </Skeleton>
      </MotiView>
      <View style={{flexDirection:'column'}}>
      <MotiView
      transition={{
          type: 'timing',
        }}
      style={{
        paddingLeft:10
      }}
      >
      <Skeleton
      colorMode={colorMode}
      show={mount}
      width={wp('40%')}
      >
      <Text
    variant="bodySmall"
    style={{
      marginLeft:10,
      color:theme.colors.tertiary
    }}
    >@{name}</Text>
      </Skeleton>
      </MotiView>
      <MotiView
      transition={{
        type: 'timing',
      }}
     style={{
      paddingTop:5,
      paddingLeft:5,
     }}
     >
      <Skeleton
      colorMode={colorMode}
      show={mount}
      width={ url ? wp('80%') : wp('80%')}
      height={url ? 30: 30}
      >
    <Text
    variant="bodyMedium"
    style={{
    marginLeft:10,
    fontSize:16,
    color:theme.colors.tertiary
    }}
    >{content}</Text>
    </Skeleton>
    </MotiView>
      {url && 
      <FastImage
      source={{
        uri:url,
        priority: FastImage.priority.normal
      }}
      resizeMode={FastImage.resizeMode.cover}
      style={{
        aspectRatio: 1,
        width:370,
        height:370,
        borderRadius: 10,
        marginTop: 8,
      }}
      />}
      {video && <Video 
            source={{
              uri: video
            }}
            repeat={true}
            ref={videoRef}
            controls={true}
            resizeMode='cover'             
            style={{
              width: 370,
              height: 400,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          />}
        <MotiView
      transition={{
        type: 'timing',
      }}
      style={{
        width:110,
        paddingTop:10,
        alignItems:'center',
        justifyContent:'center'
      }}
      >
        <Skeleton
        colorMode={colorMode}
        show={mount}
        width={wp('10%')}
        >
        <Text
       variant="bodySmall"
       style={{
        fontSize:10,
        color:theme.colors.tertiary
       }}>{date}</Text>
        </Skeleton>
      </MotiView>
    </View>
    </View>
    </Card.Content>
    <View style={styles.reactionContainer}>
    <TouchableHighlight
      onShowUnderlay={handleIsPress}
      onHideUnderlay={handleIsPress}
      onPress={LikeButton}
      style={styles.reactionIcon}
      >
      <MotiView>
        <Skeleton
        colorMode={colorMode}
        show={mount}
        >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="heart" size={17} color={theme.colors.tertiary}/>
          <Text 
          variant='bodySmall'
          style={{color:theme.colors.tertiary}}> {like_count}</Text>
        </View>
        </Skeleton>
        </MotiView>  
        </TouchableHighlight>
        <TouchableOpacity onPress={handleModalVisibility} style={styles.reactionIcon}>
          <MotiView
          style={{
            alignItems: 'center',
            justifyContent:'center'
          }}
          >
            <Skeleton
            colorMode={colorMode}
            show={mount}
            >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="comment-outline" size={15} color={theme.colors.tertiary}/>
            <Text
            variant='bodySmall'
            style={{
              paddingLeft:5,
              color:theme.colors.tertiary,
            }}>{comment_count}</Text>
          </View>
          </Skeleton>
          </MotiView>
        </TouchableOpacity>
        <Menu style={styles.reactionIcon}>
          <MenuTrigger>
          <MotiView>
          <Skeleton
          colorMode={colorMode}
          show={mount}
          >
          <Icon source='dots-horizontal' size={17} color={theme.colors.tertiary}/>
          </Skeleton>
          </MotiView>
      </MenuTrigger>  
      <MenuOptions
        customStyles={{
            optionsContainer:{
                borderRadius:10,
                marginTop:40,
                borderCurve:'continuous',
                backgroundColor:color.white,
                position:'relative'
            }
        }}
      >
        <MenuItems 
        text='Delete'
        action={handleDelete}/>
        <Divider/>
         <MenuItems 
        text='Edit Post'
        action={()=>console.log('edit')}/>
      <Divider/>
      <MenuItems 
        text='Flag'
        action={()=>console.log('flag')}/>
       <Divider/> 
      <MenuItems 
        text='Promote'
        action={()=>console.log('promote')}/>
      </MenuOptions>
    </Menu> 
      </View>
    <View style={{flex:1}}>
    <Modal
    style={{flex:1}}
    animationType='slide'
    transparent={true}
    visible={modalVisible}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={styles.centeredView}>
        <View style={styles.commentView}>
          <View style={[styles.modalView,{backgroundColor:theme.colors.onBackground}]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
              <Text
              variant='titleMedium'
              onPress={handleModalVisibility}
              style={{ fontFamily:color.textFont}}>Comments</Text>
              <TouchableOpacity onPress={SendReplyorComment}>
                <View style={styles.sendButton}>
                  <Feather name="send" size={hp(2.0)} color="#000" />
                </View>
              </TouchableOpacity>
            </View>
            <Divider
            style={{width:'100%'}}
            />
             <ScrollView
             style={{flex:1,flexGrow:1}}
             >
             <View style={{flex:1}}>
            <FlashList
            data={comments}
            estimatedItemSize={500}
            keyExtractor={(item,index) => item?.comment_id?.toString() || `default-${index}`}
            renderItem={({item}) => (
              <CommentComponent
                    auth_profile={item.auth_profile}
                    like_count={item.like_count}
                    liked_by={item.liked_by}
                    comment_count={item.comment_count}
                    content={item.content}
                    name={item.name}
                    comment_id={item.comment_id}
                    post_id={item.parentId}
                    date={TimeAgo(item?.createdAt ?? 0)}
                    onReplyPress={(id,name) => {
                      setReplyingTo(id);
                      setReplyingToUsername(name);
                    }}/>)}/>
              </View></ScrollView>
           <View style={{ bottom: 0, padding: 20 }}>
                <TextInput
                mode='outlined'
                outlineStyle={{borderRadius:30}}
                value={replyingTo ? replyingToUsername : text}
                onChangeText={(text) => setText(text)}
                style={[styles.textinput,{backgroundColor:'transparent'}]}
                placeholder="Write a comment..."
                placeholderTextColor={theme.colors.onTertiary}
                />
              </View>
          </View>
        </View>
    </KeyboardAvoidingView>
  </Modal>
  </View>
  </Card>
  )
})


const styles = StyleSheet.create({
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 60,
    },
    reactionContainer:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
      paddingBottom: 8,
    },
    reactionIcon:{
      padding:5,
      flexDirection:'row',
    },
    commentView: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    modalView: {
      borderTopRightRadius: 40,
      borderTopLeftRadius: 40,
      paddingHorizontal: 15,
      paddingTop: 20,
      width:wp('100%'),
      height:hp('55%'),
      borderWidth: 2,
      borderColor:'#000'
    },
    centeredView: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    textinput: {
      height:hp(2),
      padding: 15,
      fontSize: hp(2),
      color: '#000',
      flexDirection: 'row',
      paddingHorizontal: 10,  
    },
    sendButton: {
      padding: 10,
    },
  });

export default PostComponent