import React,{useState,useEffect} from 'react'
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
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Text,Card} from 'react-native-paper'
const CommentComponent = ({content,name,comment_id,post_id,count,date,auth_profile}) => {
    const [press,setIsPress] = useState(false)
    const [isloading,setLoading] = useState(false)
    const [showReply,setShowReply] = useState(false)
    const [isReply,setIsRely] = useState(false)
    const [reply,setReply] = useState([])
    const {user} = useAuth();
    const profileImage = useSelector((state) => state.user.profileImage)

    const handleLike = async () => {

      setLoading(true)
      const docRef = firestore().collection('posts').doc(post_id).collection('comments').doc(comment_id);
      try{
        await firestore().runTransaction(async (transaction)=>{
          const doc = await transaction.get(docRef)
          if (!doc.exists()) throw new Error ('Document doesnt exists');

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
        console.error('error liking comment:',err)
      }finally{
        setLoading(false)
      }
  
    }

    useEffect(() => {
      const fetchReply = () => {
        try {
          const docRef = firestore()
          .collection('posts')
          .doc(post_id)
          .collection('comments')
          .doc(comment_id)
          .collection('replys')
          .orderBy('createdAt', 'desc')
          const unsub = docRef.onSnapshot((querySnapshot)=>{
            let data = [];
            querySnapshot.forEach(documentSnapshot => {
              data.push({ ...documentSnapshot.data(),id:documentSnapshot.id });
            })
            setReply(data);
          })
          return () => unsub()
        }  catch (e) {
        console.error(`Error: ${e}`);
      }
    };

    fetchReply()
    },[comment_id,post_id])

    const toggleReply = () => {
      setShowReply(!showReply)
    }
    
    const handleComment = async () => {
      setIsRely(true)
      await AsyncStorage.setItem('reply',isReply)
    }
 

  return (
    <View style={styles.card}>
    <View style={styles.imageText}>
    <Image
        style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
        source={auth_profile}
        cachePolicy='none'
        placeholder={{blurhash}}/>
    <View>
    <Text
    variant='bodySmall'
    style={styles.userPost}>{name}</Text>
    <Text
    variant='bodyMedium'
    style={styles.postText}>{content}
    </Text>
    </View>
    </View>
    <View style={{paddingLeft:5}}>
      <Text style={styles.postDate}>{date}</Text>
    </View>
      <View style={styles.reactionContainer}>
    <TouchableHighlight
                 onShowUnderlay={() => setIsPress(true)}
                 onHideUnderlay={() => setIsPress(false)}
                 underlayColor='#0097b2'
                 onPress={handleLike}
                 style={styles.reactionIcon}
                 >
                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <MaterialCommunityIcons name={press ? "heart" : "cards-heart-outline"} size={20}/>
                     <Text style={styles.reactionText}>{count}</Text>
                 </View>
                 </TouchableHighlight>
        <TouchableOpacity onPress={handleComment} style={styles.reactionIcon}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="comment-processing-outline" size={20}/>
                <Text style={styles.reactionText}>{reply.length}</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleReply}>
        <View style={styles.replycontainer}>
        <View style={{borderBottomWidth:0.5,width:25,borderColor:'#8a8a8a '}}/>
        <Text style={styles.replies}>
              Reply</Text>
        </View>
      </TouchableOpacity>
      </View>
      { showReply && reply.map((replies) => {
        return <ReplyComponent key={replies.id} reply_id={replies.id} name={replies.name} content={replies.content} post_id={post_id} comment_id={comment_id} count={replies.like_count}/>
      })}
  </View>
  )
}


const styles = StyleSheet.create({
    card:{
        padding:5,
        marginTop:5,
    },
    imageText:{
      flexDirection:'row',
      marginBottom:10
      
    }
    ,
    userPost:{
      fontFamily:'Helvetica-light',
      color:'#fff',
      marginLeft:20
    }
    ,
    userTime:{
      fontFamily:'Helvetica-light',
      color:'#fff',
      marginLeft:50,
      marginTop:5,
      fontSize:10
    
    },
 
    postText:{
      fontFamily:'Helvetica-light',
      color:'#fff',
      marginLeft:20
    },
    postDate:{
      marginTop:5,
      paddin:5,
      fontSize:9,
      color:'#8a8a8a',
      fontFamily:'Helvetica-light',
    },

    reactionContainer:{
      flexDirection:'row',
      justifyContent:'space-around',
      marginTop:2

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
      fontFamily:'Helvetica-light',
      fontSize:10,
      textAlign:'center',
    },
    replies:{
      fontSize:12,
      marginLeft:10,
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