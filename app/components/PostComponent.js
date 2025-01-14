import React,{useState,useEffect} from 'react'
import {View,StyleSheet,Text,TouchableOpacity,TouchableHighlight,Modal, SafeAreaView,KeyboardAvoidingView} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import firestore from 'react-native-firebase/firestore';
import { useSelector} from 'react-redux';


const PostComponent = ({content,date,name,id,url,count,comment_count}) => {

    const [press,setIsPress] = useState(false)
    const [isloading,setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [currentComment,setCurrentComment] = useState([])
    const [comments, setComment] = useState([])
    const [text,setText] = useState('')
    const profileImage = useSelector((state) => state.user.profileimg)
    const {user} = useAuth();
    const navigation = useNavigation();

  
    const handleLike = async () => {
      if(isloading) return

      setLoading(true)
      try{
        const docRef = firestore().collection('posts').doc(id);
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
        console.log('error liking comment:',err)
      }finally{
        setLoading(false)
      }
  
    }
  return (
    <View style={styles.card}>
    <View style={styles.postContainer}>
    <View style={styles.imageText}>
    <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source={profileImage}
        placeholder={{blurhash}}
        cachePolicy='none'/>
    <View>
    <Text style={styles.userPost}>{name}</Text>
    <View style={styles.userLocationContainer}>
    </View>
    </View>
    </View>
    <View style={{marginTop:5}}>
    <Text style={styles.postText}>{content} 
      </Text>
    </View>
    {url && 
      <Image
      source={url}
      style={{width: wp(80),
        height: hp(50),
        alignSelf: 'center',
        marginVertical: 10,
        borderRadius:30}}
      />}
      <Text style={styles.postDate}>{date}</Text>
      <View style={{borderBottomColor:'#8a8a8a',borderBottomWidth:0.5,marginTop:30}}></View>
      <View style={styles.reactionContainer}>
    <TouchableHighlight
                  disabled={isloading}
                 onShowUnderlay={() => setIsPress(true)}
                 onHideUnderlay={() => setIsPress(false)}
                 underlayColor='#0097b2'
                 onPress={handleLike}
                 style={styles.reactionIcon}
                 >
                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <MaterialCommunityIcons name={press ? "heart" : "cards-heart-outline"} size={20} color={press ? '#fff':""}/>
                     <Text style={styles.reactionText}>{count}</Text>
                 </View>
                 </TouchableHighlight>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.reactionIcon}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="comment-processing-outline" size={20} color='#ffffff'/>
            <Text style={styles.reactionText}>{comment_count}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactionIcon}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <EvilIcons name='retweet' size={20} color='#ffffff'/>
          <Text style={styles.reactionText}>10</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>

    {/* () => navigation.navigate('Comment',{id}) */}
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
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={60} 
              style={styles.container}
              >
                <ChatRoomHeader onPress={handlePress} icon='keyboard-backspace' backgroundColor={color.button}/>
                <ScrollView
                keyboardShouldPersistTaps="never">
                <View>
                  {currentComment.map((comment) => {
                    return <Suspense key={comment.id} fallback={<ActivityIndicator size='small' color='#fff'/>}>
                      <PostComponent url={comment.imageUrl} count={comment.like_count} name={comment.name} content={comment.content} comment_count={comment.comment_count} date={comment.createdAt.toDate().toLocaleString()}/>
                    </Suspense>
                  })}</View>
                  {comments.map((comment) => {
                  
                    return <Suspense key={comment.id}  fallback={<ActivityIndicator size='small' color='#fff'/>}>
                            <CommentComponent count={comment.like_count} content={comment.content} name={comment.name} comment_id={comment.id} post_id={id} date={comment.createdAt.toDate().toLocaleString()}/>
                      </Suspense>
                  })}
                  </ScrollView>
                  <View>
                <View style={styles.inputContainer}>
                  <View style={styles.messageInput}>
                  <TextInput
                  value={text}
                  onChangeText={(text) => setText(text)}
                  style={[styles.textinput,{fontSize:hp(1.5)}]}
                    placeholder='Comment....'
                    placeholderTextColor="#000"
                  />
                  <TouchableOpacity onPress={handleSend}>
                    <View style={styles.sendButton}>
                    <Feather
                    name='send'
                    size={hp(2.0)}
                    color='#737373'/>
                    </View>
                  </TouchableOpacity>
                </View>
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
      
    }
    ,
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
    userLocationContainer:{
        flexDirection:'row',
    },
    userLocation:{
        fontFamily:'Helvetica-light',
        color:'#ffffff',
        marginTop:5,
        marginLeft:50,
        fontSize:10,
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
      paddin:5,
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
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    modalView: {
      margin: 10,
      backgroundColor: 'white',
      borderTopRightRadius: 20,
      borderTopLeftRadius:20,
      padding:35,
      alignItems: 'center',
      width:'100%',
      height:'70%',
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
})



export default PostComponent