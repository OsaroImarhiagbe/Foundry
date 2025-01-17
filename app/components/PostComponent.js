import React,{useState,useEffect,lazy, Suspense} from 'react'
import {View,StyleSheet,Text,TouchableOpacity,TouchableHighlight,Modal, SafeAreaView,KeyboardAvoidingView,Platform,ScrollView,TextInput,Pressable,ActivityIndicator,Dimensions} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { useSelector} from 'react-redux';
import CommentComponent from './CommentComponent';
import ReplyComponent from './ReplyComponent';
import color from '../../config/color';
import { useDispatch } from 'react-redux';
import { addComment } from '../features/PostandComments/socialSlice';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
const PostComponent = ({content,date,name,id,url,count,comment_count,mount,auth_profile}) => {

    const [press,setIsPress] = useState(false)
    const [isloading,setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [comments, setComment] = useState([])
    const [isReply,setReply] = useState(false)
    const [text,setText] = useState('')
    const dispatch = useDispatch();
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const aspectRatio = 1350 / 1080;
    const profileImage = useSelector((state) => state.user.profileimg)
    const {user} = useAuth();

    useEffect(() => {
      setLoading(true)
      const grabComments = () => {
        if(id){
          const unsub = firestore()
          .collection('posts')
          .doc(id)
          .collection('comments')
          .onSnapshot((querySnapShot) => {
            try{
                let data = []
                querySnapShot.forEach(doc =>{
                  data.push({ ...doc.data(),id:doc.id });
                })
                setComment(data)
            }catch(e){
              console.error('Error with comment',e.message)
            }
          }
          ) 
          return () => unsub()
        }
    }
    grabComments()
    },[id])

    useEffect(() => {
      const relpyStatus = async () =>{
        try{
          const status = await AsyncStorage.getItem('reply');
        setReply(status)
        }catch(error){
          console.error('Error grabbing async:',error)
        }
      }

      relpyStatus()
    },[id])

  
    const handleLike = async () => {

      setLoading(true)
      const docRef = firestore().collection('posts').doc(id);
      try{
        await firestore().runTransaction(async (transaction)=>{
          const doc = await transaction.get(docRef)
          if (!doc.exists) throw new Error ('Document doesnt exists');

          const currentLikes = doc.data().like_count || 0
          const likeBy = doc.data().liked_by || []
          const hasliked = likeBy.includes(user.userId)

          let newlike
          let updatedLike

          if(hasliked){
            newlike = currentLikes - 1
            updatedLike = likeBy.filter((id)=> id != user?.userId)
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
        console.log('error liking comment:',err)
      }finally{
        setLoading(false)
      }
    }
    
    
    const handlePost = async () => {
      if(!text) return;
      setLoading(true)
        try{
          const docRef = firestore()
          .collection('posts')
          .doc(id)
          .collection('comments')
          .doc(comments?.id)
          .collection('replys')
          const newDoc = await docRef.add({
            id:user.userId,
            name: user?.username,
            content:text,
            createdAt: Timestamp.fromDate(new Date()),
            parentId:id
          })
          await newDoc.update({
            id:newDoc.id
          })
          setText('')
          setTimeout(() =>{
            setLoading(false)
            navigation.goBack()
            Alert.alert('Success!!', 'post has sent!!');
          },1000)
        } catch (error) {
          setLoading(false)
          console.error("Error with reply:", error);
        }
      };
    

    const handleSend = async () => {
      if(!text) return;
      try{
        const docRef = await firestore().collection('posts').doc(id).collection('comments')
        const newDoc = await docRef.add({
          parentId:null,
          content:text,
          createdAt: firestore.Timestamp.fromDate(new Date())
        })
        await newDoc.update({
          id:newDoc.id
        })
        const postDocRef = await firestore().collection('posts').doc(id)
        await firestore().runTransaction(async (transaction)=>{
          const doc = await transaction.get(postDocRef)
          if (!doc.exists()) throw new Error('Doc does not exists!!')
          const commentCount = doc.data().comment_count || 0
          transaction.update(postDocRef,{
            comment_count:commentCount + 1
          })
        })
        dispatch(addComment({id:newDoc.id,postId:id,content:text}))
        setText('')
      }catch(e){
        console.error('Error with sending comments:',e)
      }
    }
  return (
    <View style={styles.card}>
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
    <Text style={styles.userPost}>{name}</Text>
    </View>
    </View>
    <View style={{marginTop:5}}>
    <Text style={styles.postText}>{content} 
      </Text>
    </View>
    {url && 
      <Image
      source={url}
      style={{
        width:400,
        height:400,
        alignSelf: 'center',
        marginVertical: 10,
        contentFit: 'cover',
        borderRadius:30}}
      />}
      <Text style={styles.postDate}>{date}</Text>
      <View style={{borderBottomColor:'#8a8a8a',borderBottomWidth:0.5,marginTop:30}}></View>
      <View style={styles.reactionContainer}>
    <TouchableHighlight
      onShowUnderlay={() => setIsPress(true)}
      onHideUnderlay={() => setIsPress(false)}
      onPress={handleLike}
      style={styles.reactionIcon}
      >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="heart" size={20} color='#fff'/>
          <Text style={styles.reactionText}>{count}</Text>
        </View>
        </TouchableHighlight>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.reactionIcon}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="comment-processing-outline" size={20} color='#ffff'/>
            <Text style={styles.reactionText}>{comment_count}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactionIcon}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <EvilIcons name='retweet' size={20} color='#ffffff'/>
          </View>
        </TouchableOpacity>
      </View>
    </View>
    <SafeAreaView>
      <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
          }}>
      <View style={styles.commentView}>
        <View style={styles.modalView}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
          <Text style={{fontFamily:color.textFont,fontSize:18,}}>Comments</Text>
          <Pressable
            style={[styles.button, styles.buttonClose,{paddingLeft:20}]}
            onPress={() => setModalVisible(!modalVisible)}>
            <Text style={styles.textStyle}>Hide Modal</Text>
          </Pressable>
          </View>
          <KeyboardAvoidingView
          enabled
          behavior='padding'
          keyboardVerticalOffset={0}
              >
        <ScrollView
        keyboardShouldPersistTaps="never">
          {comments.map((comment) => {
          
            return <Suspense key={comment.id}  fallback={<ActivityIndicator size='small' color='#fff'/>}>
                    <CommentComponent count={comment.like_count} content={comment.content} name={comment.name} comment_id={comment.id} post_id={id} date={comment.createdAt.toDate().toLocaleString()}/>
              </Suspense>
          })}
          </ScrollView>
        <View style={styles.inputContainer}>
          <View style={styles.messageInput}>
          <TextInput
          value={text}
          onChangeText={(text) => setText(text)}
          style={[styles.textinput,{fontSize:hp(1.5)}]}
            placeholder='Comment....'
            placeholderTextColor="#000"
          />
          <TouchableOpacity onPress={isReply ? handlePost : handleSend}>
            <View style={styles.sendButton}>
            <Feather
            name='send'
            size={hp(2.0)}
            color='#000'/>
            </View>
          </TouchableOpacity>
        </View>
          </View>
          </KeyboardAvoidingView>
    </View>
  </View>
      </Modal>
  </SafeAreaView>
  </View>
  )
}


const styles = StyleSheet.create({
  container:{
    flex:1
  },
  card:{
      padding:10,
    },
    image:{
      width:30,
      height:30,
      borderRadius:100
  },
    imageText:{
      flexDirection:'row',
      marginBottom:10
    },
    userPost:{
      fontFamily:'Helvetica-light',
      color:'#ffffff',
      marginLeft:50
    }
    ,
    userTime:{
      fontFamily:'Helvetica-light',
      color:'#ffffff',
      marginLeft:50,
      marginTop:5,
      fontSize:10
    
    },
    postContainer:{
      marginTop:10,
      padding:5,
      backgroundColor:'#252525',
      borderBottomLeftRadius:20,
      borderBottomRightRadius:20,
      borderTopRightRadius:20,
      borderTopLeftRadius:20
    
    },
    postText:{
      fontFamily:'Helvetica-light',
      color:'#ffffff',
      marginLeft:10
    },
    postDate:{
      marginTop:10,
      fontSize:9,
      color:'#8a8a8a',
      fontFamily:'Helvetica-light',
      marginLeft:10
    },

    reactionContainer:{
      flexDirection:'row',
      justifyContent:'space-between',
      marginTop:10
    },
    reactionIcon:{
      padding:5,
      flexDirection:'row',
    },
    reactionText:{
      color:'#ffffff',
      marginLeft:10,
      fontFamily:'Helvetica-light',
      fontSize:15
     
    },
    commentView: {
      flex: 1,
      justifyContent:'flex-end',
      alignItems: 'center',
      bottom: 0,
      left: 0,
      right: 0,
    },
    modalView: {
      margin: 0,
      backgroundColor: color.grey,
      borderTopRightRadius: 20,
      borderTopLeftRadius:20,
      padding:35,
      alignItems: 'center',
      width:'100%',
      height:'60%',
      position:'absolute',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageInput: {
      flexDirection:'row',
      justifyContent:'space-between',
      borderColor:'#000',
      borderWidth:0.5,
      borderRadius:20,
    },
    sendButton: {
      padding: 15,
      marginRight:1,
    },
    inputContainer: {
      flexDirection: 'row',
      justifyContent:'space-between',
      alignItems:'center',
      marginRight:3,
      marginLeft:3,
      padding:5,
      paddingBottom:0,
    },
    textinput:{
      flex:1,
      marginRight:2,
      padding:5,
      height:50
    },
    
})



export default PostComponent