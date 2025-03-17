import React,{useState,useEffect,memo, useCallback} from 'react'
import {View,StyleSheet,
TouchableOpacity,
TouchableHighlight,
KeyboardAvoidingView,
Platform,
Modal,
Alert,
LayoutChangeEvent
} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  addDoc, 
  collection, 
  deleteDoc, 
  doc, 
  FirebaseFirestoreTypes, 
  onSnapshot, 
  orderBy, 
  query, 
  runTransaction, 
  Timestamp } from '@react-native-firebase/firestore';
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
import { db, PostRef } from 'FirebaseConfig';
import FastImage from "@d11/react-native-fast-image";
import { perf } from '../../FirebaseConfig';
import { Skeleton } from 'moti/skeleton';
import { MotiView } from 'moti';


interface PostComponentProps {
  auth_profile?: string;
  count?: number;
  url?: string;
  id?: string;
  name?: string;
  content?: string;
  date?: string;
  comment_count?: number;
  mount?: boolean;
}
interface Comment{
  id?:string | any,
  auth_profile?:string,
  like_count?:number,
  content?:string,
  name?:string | any,
  createdAt?:FirebaseFirestoreTypes.Timestamp

}

const PostComponent: React.FC<PostComponentProps> = memo(({
  auth_profile,
  count,
  url,
  id,
  name,
  content,
  date,
  comment_count,
  mount,
}) => {

 


    const [press,setIsPress] = useState<boolean>(false)
    const [isloading,setLoading] = useState<boolean>(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [comments, setComment] = useState<Comment[]>([])
    const [text,setText] = useState('')
    const theme = useTheme()
    const {user} = useAuth();
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyingToUsername, setReplyingToUsername] = useState<string | undefined>(undefined);
   
    useEffect(() => {
      setLoading(true)
      const timer = setTimeout(() => {
        setLoading(false)
      },1000)
      return () => clearTimeout(timer)
    },[])

    useEffect(() => {
      const docRef = doc(PostRef,id)
      const commentRef = collection(docRef,'comments')
      const q = query(commentRef, orderBy('createdAt','desc'))
       const subscriber = onSnapshot(q, (querySnapShot) => {
              if (!querySnapShot || querySnapShot.empty) {
                setComment([]);
                return;
              }
              let data:Comment[] = []
              querySnapShot.forEach(documentSnapshot => {
                data.push({ ...documentSnapshot.data(),id:documentSnapshot.id });
              })
              setComment(data)
    }) 
          return () => subscriber()
    },[id])


 
    const handleLike = useCallback(async () => {
      let trace = await perf.startTrace('post_like')
      setLoading(true)
      const docRef = doc(PostRef,id);
      try{
        await runTransaction(db,async (transaction)=>{
          const doc = await transaction.get(docRef)
          if (!doc.exists) throw new Error ('Document doesnt exists');
          
          const currentLikes = doc?.data()?.like_count || 0
          const likeBy = doc?.data()?.liked_by || []
          const hasliked = likeBy.includes(user.userId)

          let newlike
          let updatedLike

          if(hasliked){
            newlike = currentLikes - 1
            updatedLike = likeBy.filter((id:string)=> id != user?.userId)
          }else{
            newlike = currentLikes + 1
            updatedLike = [...likeBy,user.userId]
          }
          transaction.update(docRef,{
            like_count:newlike,
            liked_by:updatedLike
          })
        })
        setLoading(false)
      }catch(err){
        console.error('error liking comment:',err)
        setLoading(false)
      }finally{
        setLoading(false)
        trace.stop()
      }
    },[id])

    const handleSend = useCallback(async () => {
      let trace = await perf.startTrace('post_send')
      setLoading(true)
      if(replyingTo){
        if(!text) return;
          try{
            const docRef = doc(PostRef,id)
            const commetRef = collection(docRef,'comments',replyingTo,'replys')
            const newDoc = await addDoc(commetRef,{
              id:user.userId,
              name: user?.username,
              content:text,
              createdAt: Timestamp.fromDate(new Date()),
              parentId:replyingTo
            })
            await newDoc.update({
              id:newDoc.id
            })
            setText('');
            setReplyingTo(null);
            setReplyingToUsername(undefined);
            setLoading(false)
          } catch (error) {
            setLoading(false)
            console.error("Error with reply:", error);
          }finally{
            trace.stop()
            setLoading(false)
          }
        }else{
          if(text.trim() === " ") return;
          try{
            const docRef = doc(PostRef,id)
            const commetRef = collection(docRef,'comments')
            const newDoc = await addDoc(commetRef,{
              parentId:null,
              content:text,
              auth_profile:auth_profile,
              name:user?.username,
              createdAt: Timestamp.fromDate(new Date())
            })
            await newDoc.update({
              id:newDoc.id
            })
            const postDocRef = doc(PostRef,id)
            await runTransaction(db,async (transaction)=>{
              const doc = await transaction.get(postDocRef)
              if (!doc.exists) throw new Error('Doc does not exists!!')
              const commentCount = doc?.data()?.comment_count || 0
              transaction.update(postDocRef,{
                comment_count:commentCount + 1
              })
            })
            setText('')
            setLoading(false)
          }catch(e){
            console.error('Error with sending comments:',e)
            setLoading(false)
          }finally{
            trace.stop()
            setLoading(false)
          }
    }
  },[text,replyingTo,replyingToUsername])


    const handleDelete = useCallback(async () => {
      try {
        const messagesRef = doc(PostRef,id)
        await deleteDoc(messagesRef)
        Alert.alert('Post Deleted!')
      } catch (error) {
        console.error('Error deleting document: ', error);

      }
    },[])



  return (
    
    <View style={{flex:1}}>
      <Card
      elevation={0}
      style={{backgroundColor:'transparent'}}
      >
  <Card.Content>
    <View>
    <View style={{flexDirection:'row'}}>
      <MotiView
         transition={{
          type: 'timing',
        }}>
      <Skeleton
        show={isloading}
        radius='round'
        >
      <Image
        style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
        source={require('../assets/user.png') || user.profileUrl}
        placeholder={{blurhash}}
        cachePolicy='none'/>
        </Skeleton>
      </MotiView>
    <View>
      <View style={{flexDirection:'row',alignItems:'center'}}>
      <View style={{flexDirection:'row',alignItems:'center'}}>
      <MotiView
      transition={{
          type: 'timing',
        }}
      style={{
        paddingLeft:10
      }}
      >
      <Skeleton
      show={isloading}
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
      </View>
    <View style={{paddingLeft:40}}>
    </View>
    </View>
     <MotiView
      transition={{
        type: 'timing',
      }}
     style={{
      paddingTop:5,
      paddingLeft:10,
     }}
     >
      <Skeleton
      show={isloading}
      width={ url ? wp('80%') : wp('80%')}
      height={url ? hp('50%'): 30}
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
    </View>
    </View>
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
      <MotiView
      transition={{
        type: 'timing',
      }}
      style={{
        width:50,
        paddingTop:5,
        alignItems:'center',
        justifyContent:'center'
      }}
      >
        <Skeleton
        show={isloading}
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
      <View style={styles.reactionContainer}>
    <TouchableHighlight
      onShowUnderlay={() => setIsPress(true)}
      onHideUnderlay={() => setIsPress(false)}
      onPress={handleLike}
      style={styles.reactionIcon}
      >
      <MotiView>
        <Skeleton
        show={isloading}
        >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="heart" size={17} color={theme.colors.tertiary}/>
          <Text 
          variant='bodySmall'
          style={{color:theme.colors.tertiary}}> {count}</Text>
        </View>
        </Skeleton>
        </MotiView>  
        </TouchableHighlight>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.reactionIcon}>
          <MotiView
          style={{
            alignItems: 'center',
            justifyContent:'center'
          }}
          >
            <Skeleton
            show={isloading}
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
          show={isloading}
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
    </View>
    <View style={{flex:1}}>
    <Modal
    animationType="fade"
    transparent={true}
    visible={modalVisible}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={styles.centeredView}>
        <View style={styles.commentView}>
          <View style={[styles.modalView,{backgroundColor:theme.colors.onSecondary}]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
              <Text
              variant='titleMedium'
              onPress={() => setModalVisible(!modalVisible)}
              style={{ fontFamily:color.textFont}}>Comments</Text>
              <TouchableOpacity onPress={handleSend}>
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
            keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
            renderItem={({item}) => (
              <CommentComponent
                    auth_profile={item.auth_profile}
                    count={item.like_count}
                    content={item.content}
                    name={item.name}
                    comment_id={item.id}
                    post_id={id}
                    date={item?.createdAt?.toDate().toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true})}
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
                style={styles.textinput}
                placeholder="Write a comment..."
                placeholderTextColor="#000"
                />
              </View>
          </View>
        </View>
    </KeyboardAvoidingView>
  </Modal>
  </View>
      </Card.Content>
      </Card>
  </View>
  )
})


const styles = StyleSheet.create({
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 60,
    },
    reactionContainer:{
      flexDirection:'row',
      justifyContent:'space-between',
      marginTop:5
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
      backgroundColor: '#fff',    
    },
    sendButton: {
      padding: 10,
    },
  });

export default PostComponent