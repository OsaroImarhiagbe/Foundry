import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ImageBackground,
  SafeAreaView} from 'react-native'
import {lazy,Suspense} from 'react'
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect,useCallback} from 'react';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useRoute } from '@react-navigation/native';
import FollowComponent from '../components/FollowComponent';
import {
  collection,
  doc, 
  FirebaseFirestoreTypes, 
  getDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  runTransaction,
  where} from '@react-native-firebase/firestore'
import { blurhash } from '../../utils/index';
import { useSelector } from 'react-redux';
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FlashList } from '@shopify/flash-list';
import { Divider,Text,useTheme,Button,Icon } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigatorScreenParams } from '@react-navigation/native';
import {log,recordError, setAttributes, setUserId} from '@react-native-firebase/crashlytics'
import { UsersRef,ProjectRef, PostRef,db, crashlytics} from 'FIrebaseConfig'

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


type User = {
  username?:string,
  userId?:string,
  profileUrl?:string,
  projects?:number,
  follow_state?:boolean,
  connection?:string,
  jobtitle?:string,
  location?:string

}
type Post ={
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
type Skill = {
  id:string
  skills:string
}
const OtherUserScreen = () => {
  const [users, setUsers] = useState<User | undefined>(undefined)
  const [isloading,setLoading] = useState(false)
  const navigation = useNavigation<Navigation>();
  const [isPress,setPress] = useState(false)
  const [projects,setProjects] = useState<Project[]>([])
  const [posts,setPosts] = useState<Post[]>([])
  const [skills,setSkills] = useState<Skill[]>([])
  let route = useRoute()
  const {user} = useAuth()
  const {userId} = route?.params as {userId:string}
  const other_user_id = useSelector((state:any)=>state.search.searchID)
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme()
  const {top} = useSafeAreaInsets()
  const headerimg = useSelector((state:any) => state.user.addImage)


    const follow_items = [{count:users?.projects,content:'projects'},{count:users?.connection,content:'  connection   '},{count:posts.length,content:' posts'}]


    const onRefresh = useCallback(async () => {
      log(crashlytics,'Account Screen: On Refresh')
      setRefreshing(true);
      const userDoc = doc(UsersRef,user.userId)
      const docRef = await getDoc(userDoc)
      try{
          if(docRef.exists){
            setUsers(docRef.data())
            setSkills(docRef.data()?.skllls)
            setProjects(docRef.data()?.projects)
            setPosts(docRef.data()?.posts)
            setLoading(false)
          }else{
            console.error('No such document')
          }
        }catch(error:unknown | any){
          recordError(crashlytics,error)
          setLoading(false)
        }finally{
          setRefreshing(false);
          setLoading(false)
        }
    }, [user]);



    useEffect(() => {
      log(crashlytics,'Other User Screen: Grabbing Projects')
      setLoading(true)
      if(projects.length === 0) return;
      try{
        const collectionRef = collection(UsersRef,user.userId,'projects')
        const unsub = onSnapshot(collectionRef,(docRef) => {
          if (!docRef || docRef.empty) {
            setProjects([]);
            setLoading(false);
            return;
          }
          let data:Project[] = []
          docRef.forEach(doc => {
            data.push({...doc.data(),id:doc.id})
          })
          setProjects(data)
          setLoading(false)
        })
        return () => unsub()
      }catch(error:unknown | any){
        recordError(crashlytics,error)
        console.error('error grabbing user projects:',error.message)
        setLoading(false)
      }finally{
        setLoading(false)
      }
    },[users])


    useEffect(() => {
      log(crashlytics,'Other User Screen: Grabbing Posts')
      setLoading(true)
      if (!users || !users.username) return;  
      try{
        const docRef = query(PostRef, where('name','==',users.username),orderBy('createdAt','desc'))
        const unsub = onSnapshot(docRef,(documentSnapshot) => {
          let data:Post[] = []
          documentSnapshot.forEach(doc => {
            data.push({...doc.data(),id:doc.id})
          })
          setPosts(data)
          setLoading(false)
        })
        return () => unsub()
      }catch(error:unknown | any){
        recordError(crashlytics,error)
        console.error('error grabbing user post:',error.message)
        setLoading(false)
      }finally{
        setLoading(false)
      }
    },[users])


    useEffect(() => {
      log(crashlytics,'Other User Screen: Grabbing User')
      setLoading(true) 
      setUserId(crashlytics,other_user_id),
      setAttributes(crashlytics,{
        id:other_user_id
      })
      try{
        const docRef = doc(UsersRef,other_user_id)
        const unsub = onSnapshot(docRef,
        (documentSnapshot) => {
          if (documentSnapshot.exists) {
            setUsers(documentSnapshot.data());
            setSkills(documentSnapshot.data()?.skills)
            setLoading(false)
          } else {
            console.error('No such document exists!');
          }
        },
        (error) => {
          recordError(crashlytics,error)
          console.error(`Error fetching document: ${error}`);
          setLoading(false)
        }
      );
      return () => unsub()
      }catch(error: unknown | any){
        recordError(crashlytics,error)
        setLoading(false)
      }finally{
        setLoading(false)
      }
    
  },[other_user_id])

  const Post = () => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
        <FlashList
          ListEmptyComponent={(item) => (
          <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
            <ActivityIndicator color={theme.colors.background ? '#000' :'#fff'} size='large' animating={isloading}/>
             </View>
             )}
          data={posts}
          ItemSeparatorComponent={() => <Divider/>}
          keyExtractor={item => item?.post_id?.toString() || Math.random().toString()}
          estimatedItemSize={460}
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
    </View>
    
  ); 
  
  const Projects = () => (
    <View style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      <FlashList
      data={projects}
      estimatedItemSize={460}
      contentContainerStyle={{padding:0}}
      onRefresh={onRefresh}
      ListEmptyComponent={(item) => (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
          <ActivityIndicator color={theme.colors.background ? '#000' :'#fff'} size='large' animating={isloading}/>
        </View>
      )}
      onEndReachedThreshold={0.1}
      refreshing={refreshing}
      ItemSeparatorComponent={()=> (
        <Divider/>
      )}
      ListFooterComponent={() => (
          <ActivityIndicator color='#fff' size='small' animating={isloading}/>
      )}
      renderItem={({item}) => (
        <TouchableOpacity onPress={()=>navigation.navigate('ProjectScreen')}>
        <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
       <Text style={{ textAlign: 'center', color: '#fff' }}>{item?.project_name }</Text>
     </View>
     </TouchableOpacity>
      )}
      />
    </SafeAreaView>
    </View>
  );

  const SkillsScreen = () => (
    <View style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      <FlashList
      data={skills}
      estimatedItemSize={460}
      contentContainerStyle={{padding:0}}
      onRefresh={onRefresh}
      ListEmptyComponent={(item) => (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
          <ActivityIndicator color={theme.colors.background ? '#000' :'#fff'} size='large' animating={isloading}/>
        </View>
      )}
      onEndReachedThreshold={0.1}
      refreshing={refreshing}
      ItemSeparatorComponent={()=> (
        <Divider/>
      )}
      ListFooterComponent={() => (
          <ActivityIndicator color='#fff' size='small' animating={isloading}/>
      )}
      renderItem={({item}) => (
        <TouchableOpacity onPress={()=>navigation.navigate('ProjectScreen')}>
        <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
       <Text style={{ textAlign: 'center', color: '#fff' }}>{item?.skills}</Text>
     </View>
     </TouchableOpacity>
      )}
      />
    </SafeAreaView>
    </View>
  );

  const handlePress = async () =>{
    try{
      const docRef = doc(UsersRef,other_user_id)
      await runTransaction(db, async(transaction)=>{
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
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error(error)

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
              {headerimg ? (
                  <ImageBackground
                  resizeMode="cover"
                  imageStyle={{height:150,justifyContent:'flex-end'}}
                  style={{
                  height:100,
                  bottom:0,
                  justifyContent:'flex-end',
                }}
                source={headerimg}
                >
                 <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',bottom:40}}>
                 <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'Dash'})} style={{padding:10}}>
                  <Icon
                  source='arrow-left-circle'
                  size={hp(3)}
                  />
                </TouchableOpacity>
                
                 
                   <TouchableOpacity style={{alignItems:'flex-end',padding:5}} onPress={() => console.log('button pressed')}>
                   <Icon size={hp(3)} source='pencil' color={theme.colors.tertiary}/>
                   </TouchableOpacity>
                
                  </View> 
                </ImageBackground>
              ) : (
                <ImageBackground
                resizeMode="cover"
                imageStyle={{height:150,justifyContent:'flex-end'}}
                style={{
                height:100,
                bottom:0,
                justifyContent:'flex-end',
              }}
              source={require('../assets/images/header.png')}
              >
               <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',bottom:40}}>
               <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'Dash'})} style={{padding:10}}>
                <Icon
                source='arrow-left-circle'
                size={hp(3)}
                />
              </TouchableOpacity>
              
               
                 <TouchableOpacity style={{alignItems:'flex-end',padding:5}} onPress={() => console.log('button pressed')}>
                 <Icon size={hp(3)} source='account-search' color={theme.colors.tertiary}/>
                 </TouchableOpacity>
              
                </View> 
              </ImageBackground>
              )
            }
          <View style={{
             flexDirection:'row',
             paddingLeft:10,
             justifyContent:'space-between',
             padding:5,}}>
           {
                users?.profileUrl ? 
                <Image
                style={{height:hp(8), aspectRatio:1, borderRadius:100,borderWidth:2,borderColor:theme.colors.background}}
                source={users?.profileUrl}
                placeholder={{blurhash}}
                cachePolicy='none'/> :   <Image
                style={{height:hp(8), aspectRatio:1, borderRadius:100,borderWidth:2,borderColor:theme.colors.background}}
                source={require('../assets/user.png')}
                placeholder={{blurhash}}
                cachePolicy='none'/>
       }
          <Button 
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
            borderColor:theme.colors.tertiary}}>Message</Button>
              </View>
              <View style={{marginTop:5}}>
              <View style={{paddingLeft:20,flexDirection:'column',paddingRight:20}}>
              <Text
              variant='bodySmall'
                style={{
                  color:theme.colors.onTertiary
                }}>@{users?.username}</Text>
            {users?.jobtitle && <Text
            variant='bodySmall'
            style={{
              color:theme.colors.onTertiary
            }}>{users?.jobtitle}</Text>}
            {users?.location &&    <Text
            variant='bodySmall'
            style={{
              color:theme.colors.onTertiary
            }}><EvilIcons name='location' size={15} color={theme.colors.onTertiary}/>{users?.location}</Text>}
              <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-around',alignItems:'center'}}>
              {follow_items.map((item,index)=>{
                return <FollowComponent key={index} count={item.count} content={item.content}/>
                })}
                <View style={{marginLeft:50}}>
                <Button
                onPress={handlePress}
                  mode='outlined' style={{
                  backgroundColor:'transparent', 
                  borderRadius:100,
                  borderWidth:1,
                  borderColor:theme.colors.tertiary}}>Connection</Button></View>
                  </View>
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
                    color:theme.colors.tertiary
                  }
                }}
                />
              <Tab.Screen
                name='Skills'
                component={SkillsScreen}
                options={{
                  tabBarLabelStyle:{
                    fontSize:20,
                    color:theme.colors.tertiary
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