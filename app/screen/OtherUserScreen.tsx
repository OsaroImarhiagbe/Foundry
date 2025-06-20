import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ImageBackground,
  SafeAreaView,
  useColorScheme} from 'react-native'
import React,{Suspense} from 'react'
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect,useCallback} from 'react';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useRoute } from '@react-navigation/native';
import FollowComponent from '../components/FollowComponent';
import {
  collection,
  doc, 
  getDoc, 
  onSnapshot} from '@react-native-firebase/firestore'
import { blurhash, TimeAgo } from '../../utils/index';
import { useAuth } from '../authContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FlashList } from '@shopify/flash-list';
import { Divider,Text,useTheme,Button,Icon } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigatorScreenParams } from '@react-navigation/native';
import {log,recordError, setAttributes, setUserId} from '@react-native-firebase/crashlytics'
import { UsersRef,db, crashlytics, database, functions} from '../FirebaseConfig'
import PostComponent from '../components/PostComponent';
import { equalTo, orderByChild, ref, query as databaseQuery, onValue } from '@react-native-firebase/database';
import { httpsCallable } from '@react-native-firebase/functions';




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
  Chat?:{
      userid?:string,
      name?:string
  }
  News?: NavigatorScreenParams<SecondStackParamList>;
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
  location?:string,
  headerUrl?:string

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
  createdAt?: number
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
  const [isloading,setLoading] = useState(true)
  const navigation = useNavigation<Navigation>();
  const [projects,setProjects] = useState<Project[]>([])
  const [posts,setPosts] = useState<Post[]>([])
  const [skills,setSkills] = useState<Skill[]>([])
  let route = useRoute()
  const {user} = useAuth()
  const {userId} = route?.params as {userId:string}
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme()
  const {top} = useSafeAreaInsets()
  const dark_or_light = useColorScheme()
  //const headerimg = useSelector((state:any) => state.user.addImage)
  const follow_items = [{count:users?.projects,content:'projects'},{count:users?.connection,content:'  connection   '},{count:posts.length,content:' posts'}]


  const UserRefresh = useCallback(async () => {
      setRefreshing(true)
      log(crashlytics,'Account Screen: User Refresh')
      const userDoc = doc(UsersRef,user.userId)
      const docRef = await getDoc(userDoc)
      try{
          if(docRef.exists){
            setUsers(docRef.data())
            setRefreshing(false)
          }else{
            console.error('No such document')
            setRefreshing(false)
          }
        }catch(error:unknown | any){
          recordError(crashlytics,error)
          setRefreshing(false)
        }finally{
          setRefreshing(false)
        }
    }, []);
  const ProjectRefresh = useCallback(async () => {
      setRefreshing(true)
      log(crashlytics,'Account Screen: On Refresh')
      try{
        const collectionRef = collection(db,'projects',userId,'projects')
         const unsub = onSnapshot(collectionRef,(querySnapshot) => {
          if (!querySnapshot || querySnapshot.empty) {
            setProjects([]);
            setRefreshing(false);
            return;
          }
          let data:Project[] =[]
          querySnapshot.forEach(doc => {
            data.push({...doc.data(),id:doc.id})
          })
          setProjects(data)
          setRefreshing(false)
        },(error:unknown | any) => {
          recordError(crashlytics,error)
          console.error(`Error in snapshot listener: ${error.message}`)
          setRefreshing(false)
        })
        return () => unsub()
      }catch(err:unknown | any){
        recordError(crashlytics,err)
        console.error('error grabbing user projects:',err.message)
        setRefreshing(false)
      }finally{
        setRefreshing(false)
      }
    }, []);
  const PostRefresh = useCallback(async () => {
      setRefreshing(true)
      log(crashlytics,'Account Screen: POST Refresh')
      try{
        const postRef = ref(database,'/posts')
        const orderedQuery = databaseQuery(postRef, orderByChild('auth_id'), equalTo(userId));
        const unsub = onValue(orderedQuery,async (snapshot) => {
          if (!snapshot.exists()) {
            setPosts([]);
            setRefreshing(false);
            return;
          }
          const data:Post[] = []
          Object.keys(snapshot.val()).forEach(key => {
            data.push({...snapshot.val()[key],id:key})
          })
          setPosts(data)
          setRefreshing(false)
        },(error:unknown | any) => {
          recordError(crashlytics,error)
          console.error(`Error in snapshot listener: ${error}`)
          setRefreshing(false)
        })
        return () => unsub()
      }catch(err:any){
        recordError(crashlytics,err)
        console.error('error grabbing user post:',err)
        setRefreshing(false)
      }finally{
        setRefreshing(false)
      }
    }, []);
  
  const SkillRefresh = useCallback(async () => {
      setRefreshing(true)
      log(crashlytics,'Account Screen: On Refresh')
      const userDoc = doc(UsersRef,user.userId)
      const docRef = await getDoc(userDoc)
      try{
          if(docRef.exists){
            setUsers(docRef.data())
            setRefreshing(false)
          }else{
            console.error('No such document')
            setRefreshing(false)
          }
        }catch(error:unknown | any){
          recordError(crashlytics,error)
          setRefreshing(false)
        }finally{
          setRefreshing(false)
        }
    }, []);


  useEffect(() => {
    log(crashlytics,'Other User Screen: Grabbing Projects')
    try{
      const collectionRef = collection(db,'projects',userId,'projects')
      const unsub = onSnapshot(collectionRef,(querySnapshot) => {
        if (!querySnapshot || querySnapshot.empty) {
          setProjects([]);
          setLoading(false);
          return;
        }
        let data:Project[] = []
        querySnapshot.forEach(doc => {
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
  },[userId])
  useEffect(() => {
    log(crashlytics,'Other User Screen: Grabbing Posts')
    try{
      const postRef = ref(database,'/posts')
      const orderedQuery = databaseQuery(postRef,orderByChild('auth_id'),equalTo(userId))
      const unsub = onValue(orderedQuery,(snapshot) => {
        if(!snapshot.exists()){
          setPosts([])
          setLoading(false)
          return;
        }
        const data:Post[] = []
        Object.keys(snapshot.val()).forEach(key => {
          data.push({...snapshot.val()[key],id:key})
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
  },[userId])
  useEffect(() => {
    log(crashlytics,'Other User Screen: Grabbing User')
    setUserId(crashlytics,userId)
    setAttributes(crashlytics,{
      id:userId
    });
    const docRef = doc(UsersRef,userId)
    try{
      const unsub = onSnapshot(docRef,(documentSnapshot) => {
        if(!documentSnapshot){
          setUsers(undefined)
          setLoading(false)
          return;
        }
        if (documentSnapshot.exists) {
          setUsers(documentSnapshot.data());
          setLoading(false)
        }else{
          console.error('No such document exists!');
        }
      },(error) => {
        recordError(crashlytics,error)
        console.error(`Error fetching document: ${error}`);
        setLoading(false)
      });
      return () => unsub()
    }catch(error: unknown | any){
      recordError(crashlytics,error)
      setLoading(false)
    }finally{
      setLoading(false)
    }
  },[userId])

  const Post = React.memo(() => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
        <FlashList
         ListEmptyComponent={() => (
          <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
            <Text variant='bodyMedium'>No post at the moment</Text>
          </View>
        )}
          data={posts}
          onRefresh={PostRefresh}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          ListFooterComponent={() => (
            <ActivityIndicator color='#fff' size='small' animating={isloading}/>
        )}
          ItemSeparatorComponent={() => <Divider/>}
          keyExtractor={item => item?.post_id?.toString() || Math.random().toString()}
          estimatedItemSize={460}
          renderItem={({item}) => (
            <Suspense key={item.post_id} fallback={<ActivityIndicator size="small" color="#000" />}>
                <View style={{padding: 10 }}>
                  <PostComponent auth_profile={item.auth_profile}
                  like_count={item.like_count}
                  url={item.imageUrl}
                  post_id={item.post_id}
                  name={item.name}
                  content={item.content}
                  date={TimeAgo(item?.createdAt ?? 0)}
                  comment_count={item.comment_count} />
                </View>
              </Suspense>
          )}
          />
    </SafeAreaView>
    </View>
    
  )); 
  
  const Projects = React.memo(() => (
    <View style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      <FlashList
      data={projects}
      estimatedItemSize={460}
      contentContainerStyle={{padding:0}}
      ListEmptyComponent={(item) => (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
          <Text variant='bodyMedium'>No Project displayed</Text>
        </View>
      )}
      onRefresh={ProjectRefresh}
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
  ));

  const SkillsScreen = React.memo(() => (
    <View style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      <FlashList
      data={skills}
      estimatedItemSize={460}
      contentContainerStyle={{padding:0}}
      onRefresh={SkillRefresh}
      ListEmptyComponent={(item) => (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
                <Text variant='bodyMedium'>No skill displayed</Text>
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
  ));

  const handlePress = useCallback(async () =>{
    const handleFollow = httpsCallable(functions,'handleFollow');
    try{
      await handleFollow({
        other_user_id:userId,
        currentUser:user.userId,
      }).then((results) => results.data).catch(error => recordError(crashlytics,error))
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error(error)
    }
  },[userId,user.userId])
  
  if(isloading) return null
  
    return (
    <SafeAreaView style={[styles.screen,{backgroundColor:theme.colors.background,paddingTop:Platform.OS === 'ios' ? top: 0}]}>
      <ScrollView
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        style={styles.screen}
        contentContainerStyle={{flexGrow:1}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={UserRefresh}/>}
        >
      {
    users?.headerUrl ? 
    (
        <ImageBackground
    resizeMode='cover'
    imageStyle={{height:150,justifyContent:'flex-end'}}
    style={{
    height:100,
    bottom:0,
    justifyContent:'flex-end',
  }}
  source={{uri:users?.headerUrl}}
  >
    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',bottom:40}}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:10}}>
    <Icon
    source='arrow-left-circle'
    size={hp(3)}
    color={theme.colors.background}
    />
  </TouchableOpacity>
    <TouchableOpacity style={{alignItems:'flex-end',padding:5}} onPress={() => console.log('button pressed')}>
    <Icon size={hp(3)} source='account-search' color={theme.colors.tertiaryContainer}/>
    </TouchableOpacity>
    </View> 
  </ImageBackground>) : (
      <ImageBackground
    resizeMode='cover'
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
    color={theme.colors.background}
    />
  </TouchableOpacity>
    <TouchableOpacity style={{alignItems:'flex-end',padding:5}} onPress={() => console.log('button pressed')}>
    <Icon size={hp(3)} source='account-search' color={theme.colors.tertiaryContainer}/>
    </TouchableOpacity>
    </View> 
  </ImageBackground>)
  }
  <View
  style={{
    flexDirection:'row',
    paddingLeft:10,
    justifyContent:'space-between',
    padding:5,}}>
      {
      users?.profileUrl ? (<Image
          style={{
    height:hp(8),
    aspectRatio:1,
    borderRadius:100,
    borderWidth:2,
    borderColor:theme.colors.background}}
    source={users?.profileUrl}
    placeholder={{blurhash}}
    cachePolicy='none'/>) :  (<Image
    style={{
      height:hp(8), 
      aspectRatio:1, 
      borderRadius:100,
      borderWidth:2,
      borderColor:theme.colors.background}}
      source={require('../assets/user.png')}
      placeholder={{blurhash}}
      cachePolicy='none'/>)} 
        <Button
        onPress={() => navigation.navigate('Chat',{
          userid:userId,
          name:users?.username})}
          mode='outlined'
          style={{
            backgroundColor:'transparent', 
            borderRadius:100,
            borderWidth:1,
            borderColor:theme.colors.tertiary}}>Messgae
            </Button> 
            </View>
            <View style={{marginTop:5}}>
              <View style={{paddingLeft:10,flexDirection:'column'}}>
            <Text
            variant='bodySmall'
            style={{
              color:theme.colors.onTertiary}}>@{users?.username}</Text>
          <Text
          variant='bodySmall'
          style={{
            color:theme.colors.onTertiary
          }}>{users?.jobtitle}</Text>
            <Text
          variant='bodySmall'
          style={{
            color:theme.colors.onTertiary
          }}><EvilIcons name='location' size={15} color={theme.colors.onTertiary}/>{users?.location}</Text>
          <View style={{flexDirection:'row',marginTop:10,justifyContent:'space-around',alignItems:'center'}}>
          {follow_items.map((item,index)=>{
          return (
            <FollowComponent key={index} count={item.count} content={item.content}/>)
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