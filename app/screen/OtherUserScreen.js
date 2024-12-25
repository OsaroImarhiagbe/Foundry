import {View, Text, StyleSheet, ScrollView, TouchableOpacity,Dimensions,ActivityIndicator,RefreshControl} from 'react-native'
import {lazy,Suspense} from 'react'
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect,useCallback} from 'react';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useRoute } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {db} from '../../FireBase/FireBaseConfig';
import {getDoc,doc,runTransaction,collection,query,where,onSnapshot } from 'firebase/firestore';
import ChatRoomHeader from '../components/ChatRoomHeader';
import SmallButton from '../components/SmallButton';
import FollowComponent from '../components/FollowComponent';
import { blurhash } from '../../utils/index';
import { useSelector } from 'react-redux';
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
const { width, height } = Dimensions.get('window');
const skills = ['Python','react','react native','Javascript','SQL','HTML/CSS','Linux','Django']
const PostComponent = lazy(() => import('../components/PostComponent'))




  const Tab = createMaterialTopTabNavigator();
  


const OtherUserScreen = () => {


    const [users, setUsers] = useState('')
    const [isloading,setLoading] = useState(false)
    const navigation = useNavigation();
    const [isPress,setPress] = useState(false)
    const [posts,setPosts] = useState([])
    let route = useRoute()
    const {user} = useAuth()
    const {userId} = route.params
    const other_user_id = useSelector((state)=>state.search.searchID)
    const [refreshing, setRefreshing] = useState(false);
  
    const follow_items = [{count:users.projects,content:'projects'},{count:users.connection,content:'connection'},{count:posts.length,content:'posts'}]

    const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
    }, [other_user_id]);


    useEffect(() => {
      try{
        const docRef = collection(db,'posts')
        const q = query(docRef,where('name','==',users?.username))
        const unsub = onSnapshot(q,(snapShot) => {
          let data = []
          snapShot.forEach(doc => {
            data.push({...doc.data(),id:doc.id})
          })
          setPosts(data)
        })
      }catch(err){
        console.log('error grabbing user post:',err)
      }

    },[users])



    useEffect(() => {
        const fetchUser = async () => {
        const userDoc = doc(db,'users',other_user_id)
        const unsub = onSnapshot(
          userDoc,
          (snapshot) => {
            if (snapshot.exists()) {
              setUsers(snapshot.data());
            } else {
              console.error('No such document exists!');
            }
          },
          (error) => {
            console.error(`Error fetching document: ${error}`);
          }
        );

        return unsub; 
      };
    
      fetchUser()
      return () => {
        setLoading(false)
      }
    
  },[other_user_id])

  const Post = () => (
    <ScrollView
    scrollEnabled={true}
     style={{flex:1,backgroundColor:color.backgroundcolor}}>
      <View style={{flex:1,backgroundColor:color.backgroundcolor}}>
      {posts.map((post) => (
        <Suspense key={post.id} fallback={<ActivityIndicator size="small" color="#000" />}>
          <View style={{padding: 10 }}>
            <PostComponent count={post.like_count} url={post.imageUrl} id={post.id} name={post.name} content={post.content} date={post.createdAt.toDate().toLocaleString()} />
          </View>
        </Suspense>
      ))}
    </View>
    </ScrollView>
    
  ); 
  
  const Projects = () => (
    <ScrollView style={{flex:1,backgroundColor:color.backgroundcolor}}>
    <View style={{flex:1,backgroundColor:color.backgroundcolor,padding:50}}>
      {skills.map((item, index) => (
        <TouchableOpacity key={index} onPress={()=>navigation.navigate('ProjectScreen')}>
           <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
          <Text style={{ textAlign: 'center', color: '#fff' }}>{item}</Text>
        </View>
        </TouchableOpacity>
      ))}
    </View>
    </ScrollView>
  );

  const handlePress = async () =>{
    try{
      const docRef = doc(db,'users',other_user_id)
      await runTransaction(db,async(transaction)=>{
        const doc = await transaction.get(docRef)
        if(!doc.exists()) throw new Error("Doc doesn't exists!")
        
        const currentConnectCount = doc.data().connection || 0
        const follow_by = doc.data().follow_by || []
        const hasFollowed = follow_by.includes(user.userId)

        let newFollowed;
        let updateFollow;
        let newState;

        if(hasFollowed){
          newFollowed = currentConnectCount - 1
          updateFollow = follow_by.filter((id)=> id != user.userId)
          newState = false
          setPress(newState)
        }else{
          newFollowed = currentConnectCount + 1
          updateFollow = [...follow_by,user.userId]
          newState = true
          setPress(newState)
        }
        transaction.update(docRef,{
          connection: newFollowed,
          follow_by:updateFollow,
          follow_state:newState
        })
        
      })
      
    }catch(err){
      console.log(err)

    }
  }
  
  if(isloading) return null
  
    return (
        <View style={styles.screen}>
          <ChatRoomHeader 
            onPress={()=>navigation.navigate('Main')} 
            backgroundColor={color.button} 
            icon='keyboard-backspace' 
            onPress2={() => navigation.navigate('Message')}
            />
            <ScrollView
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            style={styles.screen}
            contentContainerStyle={{flexGrow:1}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
            >
            <View style={styles.profileContainer}>
              <View style={{flexDirection:'row', justifyContent:'space-between',paddingLeft:20}}>
              <Image
                  style={{height:hp(10), aspectRatio:1, borderRadius:100,}}
                  source={users?.profileUrl}
                  placeholder={{blurhash}}
                  transition={500}/>
                  <View style={{marginTop:20,flexDirection:'row', justifyContent:'space-evenly',paddingRight:20}}>
                  <Text style={{fontSize:30, color:'#fff'}}>  {
                        other_user_id ? (<Text style={styles.username}>@{users?.username}</Text>) 
                        : (<Text style={styles.username}>@{users?.username}</Text>)
                      }</Text>
                      {other_user_id && (
                  <TouchableOpacity style={{paddingLeft:20}}onPress={() => navigation.navigate('Chat',{userid:userId,name:users?.username})}>
                    <AntDesign name='message1' size={25} color='#00BF63'/>
                  </TouchableOpacity>)}
                  </View>
                  </View>
                  <View style={{alignItems:'flex-end',flexDirection:'column',marginBottom:20,paddingRight:20}}>
                  <Text style={styles.title}>{users.jobtitle}</Text>
                  <Text style={styles.location}><EvilIcons name='location' size={20}/> {users.location}</Text>
                  </View>
                  </View>
                  <View style={styles.textcontainer}>
                    <View style={{flexDirection:'column',alignItems:'stretch'}}>
                      <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                        {follow_items.map((item,index)=>{
                          return <FollowComponent key={index} count={item.count} content={item.content}/>
                        })}
                      </View>
                    </View>
                  </View>
                  <View style={styles.aboutContainer}>
                    <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                      <TouchableOpacity onPressIn={handlePress}>
                      <SmallButton name={users.follow_state ? 'Connecting...' : 'Connect'} isTrue={users.follow_state}/>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => navigation.navigate('Edit')}>
                        {!other_user_id &&  <SmallButton name='Edit Profile'/>}
                        <SmallButton name='Mentor'/>
                      </TouchableOpacity>
                    </View>
                    </View>
                    <View style={{flex: 1}}>
                  <Tab.Navigator
                screenOptions={{
                  headerShown:false,
                  swipeEnabled:true,
                  tabBarIndicatorStyle:{
                    backgroundColor:'#00BF63'
                  },
                  tabBarStyle:{
                    backgroundColor:color.backgroundcolor,
                  },
                  tabBarShowLabel:false
                }}
                >
                  <Tab.Screen
                    name='Post'
                    component={Post}
                    options={{
                      tabBarIcon:() => (
                        <MaterialCommunityIcons name='post' color='#00bf63' size={25}
                        />),
                    }}
                    />
                    <Tab.Screen
                    name='Projects'
                    component={Projects}
                    options={{
                      lazy,
                      tabBarIcon:() => (
                        <MaterialIcons name='work' color='#00bf63' size={25}
                        />),
                    }}
                    />
                  </Tab.Navigator>
                </View> 
            </ScrollView> 
        </View>
       
      )
    }
    
const styles = StyleSheet.create({
      aboutContainer:{
        padding:10,
      },
      aboutText:{
        fontSize:15,
        fontWeight:'bold'
      },
      profileContainer:{
        marginTop:10,
        padding:10,
      },
      screen:{
        backgroundColor:'#1F1F1F',
        flex:1
      },
      text:{
        fontSize:12,
        fontWeight:'bold',
        letterSpacing:1,
        padding:5
      },
      textcontainer:{
        marginTop:10,
        padding:10,
      },
      username:{
        fontSize:30,
        letterSpacing:1,
        fontWeight:'bold',
       fontFamily:'Helvetica-light'
      },
      location:{
        fontSize:15,
        color:'#fff',
        fontFamily:'Helvetica-light'
      },
      title:{
        fontSize:15,
        color:'#fff',
        fontFamily:'Helvetica-light'
      },
    
    
    })

export default OtherUserScreen