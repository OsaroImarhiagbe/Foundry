import React,{useState} from 'react'
import {View,StyleSheet,Text,TouchableOpacity,TouchableHighlight} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import color from '../../config/color';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore'
const ReplyComponent = ({name,content,post_id,comment_id,reply_id,count}) => {

    const [press,setIsPress] = useState(false)
    const {user} = useAuth();
    const profileImage = useSelector((state) => state.user.profileImage)

    const handleLike = async () => {
      if(isloading) return

      setLoading(true)
      try{
        const docRef = firestore()
        .collection('posts')
        .doc(post_id)
        .collection('comments')
        .doc(comment_id)
        .collection('replys')
        .doc(reply_id);
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

return (
    <View style={styles.card}>
    <View style={styles.postContainer}>
    <View style={styles.imageText}>
    <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source={profileImage}
        placeholder={{blurhash}}
        transition={500}/>
    <View>
    <Text style={styles.userPost}>{name}</Text>
    <View style={styles.userLocationContainer}>
    <Text style={styles.userTime}>Time</Text>
    <Text style={styles.userLocation}>Near Domain Street</Text>
    </View>
    </View>
    </View>
      <Text style={styles.postText}>{content}
      </Text>
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
        <TouchableOpacity style={styles.reactionIcon}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="comment-processing-outline" size={20}/>
                <Text style={styles.reactionText}>0</Text>
            </View>
        </TouchableOpacity>
      </View>
    </View>
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
      marginBottom:20
      
    }
    ,
    userPost:{
      fontFamily:color.textFont,
      color:'#000',
      marginLeft:50
    
    }
    ,
    userTime:{
      fontFamily:color.textFont,
      color:'#000',
      marginLeft:50,
      marginTop:5,
      fontSize:10
    
    },
    userLocationContainer:{
        flexDirection:'row',
    },
    userLocation:{
        fontFamily:color.textFont,
        color:'#000',
        marginLeft:100,
        marginTop:5,
        fontSize:10,
    },
    postContainer:{
      marginTop:10,
      padding:20,
      borderBottomLeftRadius:20,
      borderBottomRightRadius:20,
      borderTopRightRadius:20,
      borderTopLeftRadius:4
    
    },
    postText:{
      fontFamily:color.textFont,
      color:'#000',
    },
    postDate:{
      marginTop:5,
      paddin:5,
      fontSize:9,
      color:'#8a8a8a',
      fontFamily:color.textFont,
      

    },

    reactionContainer:{
      flexDirection:'row',
      justifyContent:'space-around',
      marginTop:20

    },
    reactionIcon:{
      padding:5,
      width:100,
      flexDirection:'row',
      borderRadius:10,
    },
    reactionText:{
      color:'#000',
      marginLeft:10,
      fontFamily:color.textFont,
      fontSize:10,
      textAlign:'center',
    },
    replies:{
      textAlign:'center',
      fontSize:10
    },
    repliesContainer:{
      marginTop:10
    }
})
export default ReplyComponent