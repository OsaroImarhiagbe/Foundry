import React,{useState,useEffect,lazy, Suspense} from 'react'
import {View,StyleSheet,
TouchableOpacity,
TouchableHighlight,
SafeAreaView,
KeyboardAvoidingView,
Platform,
Modal,
Alert,
useWindowDimensions,
} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useSelector} from 'react-redux';
import CommentComponent from './CommentComponent';
import ReplyComponent from './ReplyComponent';
import color from '../../config/color';
import { useDispatch } from 'react-redux';
import { addComment } from '../features/PostandComments/socialSlice';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card,Text,Divider,Icon} from 'react-native-paper';
import { FlashList } from "@shopify/flash-list";
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme,TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import {removeID} from '../features/Message/messageidSlice';
import {
  Menu,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MenuItems } from '../components/CustomMenu'
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

interface Reply{
  id?:string,
  auth_profile?:string,
  like_count?:number,
  content?:string,
  name?:string,
  createdAt?:FirebaseFirestoreTypes.Timestamp

}

const PostComponent: React.FC<PostComponentProps> = ({
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
    const {height, width} = useWindowDimensions();
    const dispatch = useDispatch();
    const theme = useTheme()
    const {user} = useAuth();
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyingToUsername, setReplyingToUsername] = useState<string | undefined>(undefined);

 

    useEffect(() => {
      const docRef = firestore().collection('posts').doc(id)
       const subscriber =  docRef.collection('comments').orderBy('createdAt','desc').onSnapshot((querySnapShot) => {
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


 
 
    const handleLike = async () => {

      setLoading(true)
      const docRef = firestore().collection('posts').doc(id);
      try{
        await firestore().runTransaction(async (transaction)=>{
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
      }catch(err){
        console.error('error liking comment:',err)
      }finally{
        setLoading(false)
      }
    }
    const handleSend = async () => {
      if(replyingTo){
        if(!text) return;
        setLoading(true)
          try{
            const docRef = firestore()
            .collection('posts')
            .doc(id)
            .collection('comments')
            .doc(replyingTo)
            .collection('replys')
            const newDoc = await docRef.add({
              id:user.userId,
              name: user?.username,
              content:text,
              createdAt: firestore.Timestamp.fromDate(new Date()),
              parentId:replyingTo
            })
            await newDoc.update({
              id:newDoc.id
            })
            setText('');
            setReplyingTo(null);
            setReplyingToUsername(undefined);
          } catch (error) {
            setLoading(false)
            console.error("Error with reply:", error);
          }
        }else{
          if(text.trim() === " ") return;
          try{
            const docRef = firestore().collection('posts').doc(id).collection('comments')
            const newDoc = await docRef.add({
              parentId:null,
              content:text,
              auth_profile:auth_profile,
              name:user?.username,
              createdAt: firestore.Timestamp.fromDate(new Date())
            })
            await newDoc.update({
              id:newDoc.id
            })
            const postDocRef = firestore().collection('posts').doc(id)
            await firestore().runTransaction(async (transaction)=>{
              const doc = await transaction.get(postDocRef)
              if (!doc.exists) throw new Error('Doc does not exists!!')
              const commentCount = doc?.data()?.comment_count || 0
              transaction.update(postDocRef,{
                comment_count:commentCount + 1
              })
            })
            setText('')
          }catch(e){
            console.error('Error with sending comments:',e)
          }
    }
  }


    const handleDelete = async () => {
      try {
        const messagesRef = firestore().collection('posts').doc(id)
        await messagesRef.delete()
        Alert.alert('Post Deleted!')
      } catch (error) {
        console.error('Error deleting document: ', error);

      }
    }
  return (
    
    <SafeAreaView>
      <Card
      elevation={0}
      style={{backgroundColor:'transparent'}}
      >
      <Card.Content>
      <View style={styles.postContainer}>
    <View style={styles.imageText}>
      {mount ? <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source=''
        placeholder={{blurhash}}
        cachePolicy='none'/> : <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source={auth_profile}
        placeholder={{blurhash}}
        cachePolicy='none'/>}
    <View>
    <View style={{flexDirection:'row',alignItems:'center'}}>
      <View style={{flexDirection:'row',alignItems:'center'}}>
      <Text
    variant="bodySmall"
    style={{
      marginLeft:10,
      fontSize:16,
      color:theme.colors.onTertiary
    }}
    >@{name}</Text>
      </View>
    <View style={{paddingLeft:40}}>
    </View>
    </View>
    <Text
    variant="bodySmall"
    style={{
    marginLeft:10,
    marginVertical:5,
    fontSize:16,
    color:theme.colors.tertiary
    }}
    >{content}</Text>
    </View>
    </View>
    {url && 
      <Image
      source={url}
      contentFit='cover'
      style={{
        aspectRatio:1,
        width:wp('100%'),
        height:hp('50%'),
        alignSelf: 'center',}}
      />}
      <Text
       variant="bodySmall"
       style={{
        color:theme.colors.tertiary
       }}>{date}</Text>
      <View style={styles.reactionContainer}>
    <TouchableHighlight
      onShowUnderlay={() => setIsPress(true)}
      onHideUnderlay={() => setIsPress(false)}
      onPress={handleLike}
      style={styles.reactionIcon}
      >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="heart" size={15} color={theme.colors.onTertiary}/>
          <Text 
          variant='bodySmall'>{count}</Text>
        </View>
        </TouchableHighlight>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.reactionIcon}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="comment-processing-outline" size={15} color={theme.colors.onTertiary}/>
            <Text
            variant='bodySmall'
            style={{
              color:theme.colors.onPrimary,
              marginLeft:5,
              marginBottom:5
            }}>{comment_count}</Text>
          </View>
        </TouchableOpacity>
        <Menu style={styles.reactionIcon}>
      <MenuTrigger>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon source='dots-horizontal' size={15} color={theme.colors.onTertiary}/>
          </View>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
            optionsContainer:{
                borderRadius:10,
                marginTop:40,
                marginLeft:-30,
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
    <View>
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
            <FlashList
            data={comments}
            estimatedItemSize={460}
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
                    }}/>)}/></ScrollView>
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
  </SafeAreaView>
  )
}


const styles = StyleSheet.create({
    imageText:{
      flexDirection:'row',
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 60,
    },
    postContainer:{
      marginTop:5,  
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