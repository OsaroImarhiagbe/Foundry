import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  SafeAreaView} from 'react-native'
import {lazy,Suspense} from 'react'
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect,useCallback} from 'react';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useRoute } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ChatRoomHeader from '../components/ChatRoomHeader';
import SmallButton from '../components/SmallButton';
import FollowComponent from '../components/FollowComponent';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import { blurhash } from '../../utils/index';
import { useSelector } from 'react-redux';
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FlashList } from '@shopify/flash-list';
import { Divider,Text,useTheme,Button,Icon } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigatorScreenParams } from '@react-navigation/native';

const PostComponent = lazy(() => import('../components/PostComponent'))




const Tab = createMaterialTopTabNavigator();

type SecondStackParamList = {
  Chat?: {
    userid?: string;
    name?: string;
  };
}
  
type RootStackParamList = {
  ProjectScreen?: undefined;
  Main?: undefined;
  Message?: undefined;
  Edit?: undefined;
  Welcome?: {
    screen?: string;
  };
  SecondStack?: NavigatorScreenParams<SecondStackParamList>;
}

type Navigation = NativeStackNavigationProp<RootStackParamList>;


interface User{
  username?:string,
  userId?:string,
  profileUrl?:string,
  projects?:number,
  follow_state?:boolean,
  connection?:string,
  jobtitle?:string,
  location?:string

}
interface Post{
  auth_profile?: string;
  like_count?: number;
  imageUrl?: string;
  id?: string;
  name?: string;
  post_id?:string,
  content?: string;
  date?: string;
  comment_count?: number;
  mount?: boolean;
  createdAt?: FirebaseFirestoreTypes.Timestamp
}
interface Project{
  id?:string,
  project_name?:string
}
const OtherUserScreen = () => {


    const [users, setUsers] = useState<User | undefined>(undefined)
    const [isloading,setLoading] = useState(false)
    const navigation = useNavigation<Navigation>();
    const [isPress,setPress] = useState(false)
    const [projects,setProjects] = useState<Project[]>([])
    const [posts,setPosts] = useState<Post[]>([])
    let route = useRoute()
    const {user} = useAuth()
    const {userId} = route?.params as {userId:string}
    const other_user_id = useSelector((state:any)=>state.search.searchID)
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme()
    const {top} = useSafeAreaInsets()

    const follow_items = [{count:users?.projects,content:'projects'},{count:users?.connection,content:'connection'},{count:posts.length,content:'posts'}]


    const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // await fetchUser();
    setRefreshing(false);
    }, [other_user_id]);



    useEffect(() => {
      if(projects.length === 0) return;
      try{
        const unsub = firestore()
        .collection('projects')
        .where('id','==',users?.userId)
        .onSnapshot(snapShot => {
          let data:Project[] = []
          snapShot.forEach(doc => {
            data.push({...doc.data(),id:doc.id})
          })
          setProjects(data)
        })
        return () => unsub()
      }catch(err){
        console.error('error grabbing user projects:',err)
      }
    },[users])


    useEffect(() => {
      if (!users || !users.username) return;  
      try{
        const unsub = firestore()
        .collection('posts')
        .where('name','==',users.username)
        .orderBy('createdAt','desc')
        .onSnapshot(documentSnapshot => {
          let data:Post[] = []
          documentSnapshot.forEach(doc => {
            data.push({...doc.data(),id:doc.id})
          })
          setPosts(data)
        })
        return () => unsub()
      }catch(err:any){
        console.error('error grabbing user post:',err.message)
      }
    },[users])


    useEffect(() => {
      if(!other_user_id) return 
      const unsub = firestore()
        .collection('users')
        .doc(other_user_id)
        .onSnapshot(
          (documentSnapshot) => {
            if (documentSnapshot.exists) {
              setUsers(documentSnapshot.data());
            } else {
              console.error('No such document exists!');
            }
          },
          (error) => {
            console.error(`Error fetching document: ${error}`);
          }
        );
        return () => unsub()
    
  },[other_user_id])

  const Post = () => (
    <ScrollView
    scrollEnabled={true}
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
          <FlashList
          ListEmptyComponent={() => 
            (<Text style={{ color: '#fff', textAlign: 'center', fontFamily:color.textFont,fontSize:20}}>No posts available</Text>)}
          data={posts}
          ItemSeparatorComponent={() => <Divider/>}
          keyExtractor={item => item?.post_id?.toString() || Math.random().toString()}
          estimatedItemSize={402}
          renderItem={({item}) => (
            <Suspense key={item.post_id} fallback={<ActivityIndicator size="small" color="#000" />}>
                <View style={{padding: 10 }}>
                  <PostComponent auth_profile={item.auth_profile}
                  count={item.like_count}
                  url={item.imageUrl}
                  id={item.post_id}
                  name={item.name}
                  content={item.content}
                  date={item?.createdAt?.toDate().toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true})}
                  comment_count={item.comment_count} />
                </View>
              </Suspense>
          )}
          />
    </SafeAreaView>
    </ScrollView>
    
  ); 
  
  const Projects = () => (
    <ScrollView style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      {
        projects && projects.length > 0 ? (
          projects.map((project, index) => (
        
          <TouchableOpacity key={index} onPress={()=>navigation.navigate('ProjectScreen')}>
             <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
            <Text style={{ textAlign: 'center', color: '#fff' }}>{project?.project_name }</Text>
          </View>
          </TouchableOpacity>
        ))) : <Text style={{ color: '#fff', textAlign: 'center', fontFamily:color.textFont,fontSize:20}}>No projects available</Text>
      }
      
    </SafeAreaView>
    </ScrollView>
  );

  const SkillsScreen = () => (
    <ScrollView scrollEnabled style={{flex:1,backgroundColor:theme.colors.background}}>
    <View style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      {
        projects && projects.length > 0 ? (
          projects.map((project, index) => (
        
          <TouchableOpacity key={index} onPress={()=>navigation.navigate('ProjectScreen')}>
             <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
            <Text style={{ textAlign: 'center', color: '#fff' }}>{project?.project_name}</Text>
          </View>
          </TouchableOpacity>
        ))) : <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text variant='bodySmall' style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No skills available</Text></View>
      }
      
    </View>
    </ScrollView>
  );

  const handlePress = async () =>{
    try{
      const docRef = firestore().collection('users').doc(other_user_id)
      await firestore().runTransaction(async(transaction)=>{
        const doc = await transaction.get(docRef)
        if(!doc.exists) throw new Error("Doc doesn't exists!")
        
        const currentConnectCount = doc?.data()?.connection || 0
        const follow_by = doc?.data()?.follow_by || []
        const hasFollowed = follow_by.includes(user.userId)

        let newFollowed;
        let updateFollow;
        let newState;

        if(hasFollowed){
          newFollowed = currentConnectCount - 1
          updateFollow = follow_by.filter((id:string)=> id != user.userId)
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
      console.error(err)

    }
  }
  
  if(isloading) return null
  
    return (
        <SafeAreaView style={[styles.screen,{backgroundColor:theme.colors.background,paddingTop:Platform.OS === 'ios' ? top: 0}]}>
            <ScrollView
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            style={styles.screen}
            contentContainerStyle={{flexGrow:1}}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
            >
            <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'Dash'})} style={{padding:10}}>
            <Icon
            source='arrow-left-circle'
            size={25}
            />
          </TouchableOpacity>
          <View style={{flexDirection:'row',paddingLeft:20,marginTop:10,justifyContent:'space-between',paddingRight:20}}>
          <Image
              style={{height:hp(7), aspectRatio:1, borderRadius:100,}}
              source={users?.profileUrl}
              placeholder={{blurhash}}
              cachePolicy='none'/>
            {other_user_id &&  <Button 
            onPress={() => navigation.navigate('SecondStack',{
              screen:'Chat',
              params:{
                userid:userId,
                name:users?.username
              }
            })}
            mode='outlined' style={{
            backgroundColor:'transparent', 
            borderRadius:100,
            borderWidth:1,
            borderColor:theme.colors.tertiary}}>Message</Button>}
              </View>
              <View style={{marginTop:5,flexDirection:'column',paddingRight:20}}>
              <View style={{paddingLeft:20}}>
               <Text>{
                    other_user_id ? (<Text
                    variant='bodySmall'
                      style={{
                        color:theme.colors.onPrimary
                      }}>@{users?.username}</Text>) 
                    : (<Text
                    variant='bodySmall'
                      style={{
                        color:theme.colors.onPrimary
                      }}>@{users?.username}</Text>)
                  }</Text>
                  {users?.jobtitle &&   <Text
                  variant='bodySmall'
                  style={{
                    color:theme.colors.onPrimary
                  }}>{users?.jobtitle}</Text>}
                  {users?.location &&    <Text
                  variant='bodySmall'
                  style={{
                    color:theme.colors.onPrimary
                  }}><EvilIcons name='location' size={15} color={theme.colors.onTertiary}/>{users?.location}</Text>}
                    {follow_items.map((item,index)=>{
                      return <FollowComponent key={index} count={item.count} content={item.content}/>
                    })}
                </View>
              </View>
                    <View style={{flex: 1}}>
                  <Tab.Navigator
                screenOptions={{
                  swipeEnabled:true,
                  tabBarIndicatorStyle:{
                    backgroundColor:theme.colors.primary
                  },
                  tabBarStyle:{
                    backgroundColor:theme.colors.background,
                  },
                }}
                ><Tab.Screen
                name='Posts'
                component={Post}
                options={{
                  tabBarLabelStyle:{
                    fontSize:20,
                    color:'#000'
                  }
                }}
                />
                <Tab.Screen
                name='Projects'
                component={Projects}
                options={{
                  tabBarLabelStyle:{
                    fontSize:20,
                    color:theme.colors.onPrimary
                  }
                }}
                />
              <Tab.Screen
                name='Skills'
                component={SkillsScreen}
                options={{
                  tabBarLabelStyle:{
                    fontSize:20,
                    color:theme.colors.onPrimary
                  }
                }}
                />
                  </Tab.Navigator>
                </View> 
            </ScrollView> 
        </SafeAreaView>
       
      )
    }
    
const styles = StyleSheet.create({
      screen:{
        flex:1
      },
      text:{
        fontSize:12,
        fontWeight:'bold',
        letterSpacing:1,
        padding:5
      },
      username:{
        letterSpacing:1,
      },
    })

export default OtherUserScreen