import React,{memo, useCallback, useState} from 'react'
import {View,StyleSheet,TouchableHighlight} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import color from '../../config/color';
import { useSelector } from 'react-redux';
import { crashlytics, functions } from '../FirebaseConfig';
import { httpsCallable } from '@react-native-firebase/functions';
import { Card,Text,useTheme,Divider } from 'react-native-paper';
import { recordError } from '@react-native-firebase/crashlytics';

interface ReplyProp{
  name?:string,
  content?:string,
  post_id?:string,
  comment_id?:string,
  reply_id?:string,
  date?:string
  count?:number
}
const ReplyComponent:React.FC<ReplyProp> = memo(({name,content,post_id,comment_id,reply_id,count}) => {

    const [press,setIsPress] = useState<boolean>(false)
    const [isloading,setLoading] = useState<boolean>(true)
    const {user} = useAuth();
    const theme = useTheme()
    const profileImage = useSelector((state:any) => state.user.profileImage)

    const LikeButton = useCallback(async () => {
      const handleLike = httpsCallable(functions,'handleLike')
      try{
        await handleLike({
          post_id:post_id,
          comment_id:comment_id,
          reply_id:reply_id
        }).catch((error) => recordError(crashlytics,error))
      }catch(err){
        console.error('error liking comment:',err)
      }finally{
        setLoading(false)
      }
  
    },[post_id,comment_id,reply_id])

return (
    <Card
    mode='contained'
    style={{backgroundColor:theme.colors.onSecondary}}>
    <Card.Content style={styles.postContainer}>
    <View style={styles.imageText}>
    <Image
        style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
        source={profileImage}
        cachePolicy='none'
        placeholder={{blurhash}}/>
    <View>
    <Text
    variant='bodySmall'
    style={{
      marginLeft:30,
      color:theme.colors.primary
    }}
    >{name}</Text>
    <Text
    variant='bodySmall'
    style={{
      marginLeft:30,
      marginVertical:5,
      color:theme.colors.primary
      }}>{content}
    </Text>
    </View>
    </View>
      <View style={styles.reactionContainer}>
    <TouchableHighlight
      onShowUnderlay={() => setIsPress(true)}
      onHideUnderlay={() => setIsPress(false)}
      underlayColor='#0097b2'
      onPress={LikeButton}
      style={styles.reactionIcon}
      >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name={press ? "heart" : "cards-heart-outline"} size={20}/>
          <Text
          variant='bodySmall'
          style={styles.reactionText}>{count}</Text>
      </View>
      </TouchableHighlight>
      <View style={styles.replycontainer}>
       <Divider style={{borderBottomWidth:0.5,width:25,borderColor:'#8a8a8a '}}/>
        <Text
        variant='bodySmall'
        style={styles.replies}>
              Reply</Text>
        </View>
      </View>
    </Card.Content>
  </Card>
  )
})


const styles = StyleSheet.create({
    card:{
        padding:10,
        marginTop:5,
      },
      image:{
        width:30,
        height:30,
        borderRadius:100
    },
    imageText:{
      flexDirection:'row',
      marginBottom:5
    }
    ,
    postContainer:{
      marginTop:10,
      padding:20,
      borderBottomLeftRadius:20,
      borderBottomRightRadius:20,
      borderTopRightRadius:20,
      borderTopLeftRadius:4
    
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
      color:'#000',
      marginLeft:10,
      fontFamily:color.textFont,
      fontSize:10,
      textAlign:'center',
    },
    replies:{
      marginLeft:5,
      textAlign:'center'
    },
    repliesContainer:{
      marginTop:10
    },
    replycontainer:{
      marginTop:5,
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'center'
      }
})
export default ReplyComponent