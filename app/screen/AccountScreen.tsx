import {
  View,
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  useWindowDimensions,
  Platform,
  RefreshControl,
  TouchableWithoutFeedback} from 'react-native'
import {lazy,Suspense} from 'react'
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect,useCallback} from 'react';
import { useAuth } from '../authContext';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FollowComponent from '../components/FollowComponent';
import { collection, query, where,FirebaseFirestoreTypes,doc, orderBy, onSnapshot} from '@react-native-firebase/firestore';
import { blurhash } from '../../utils/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  useTheme,
  Text,Icon,
  Button,
  Divider,
  ActivityIndicator} from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { FlashList } from '@shopify/flash-list';
import {PostRef, ProjectRef, UsersRef,crashlytics} from 'FIrebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { log, recordError, setAttributes, setUserId } from '@react-native-firebase/crashlytics';
import { launchImageLibrary } from 'react-native-image-picker';
import {Image as ImageCompressor} from 'react-native-compressor';
const PostComponent = lazy(() => import('../components/PostComponent'))


{/** NEED TO LOOK AT USEEFFECT THAT IS GRABBING POST AND PROJECTS AND SKILLS NEED TO IMPLEMENT IT FOR SKILLS AND PROJECTS*/}

const Tab = createMaterialTopTabNavigator();


 
const AccountScreen = () => {

  const [users, setUsers] = useState<User | undefined>(undefined)
  const [isloading,setLoading] = useState<boolean>(false)
  const [projects,setProjects] = useState<Project[]>([])
  const [posts,setPosts] = useState<Post[]>([])
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [filename,setFileName] = useState<string | undefined>(undefined);
  const navigation = useNavigation<Navigation>();
  const isCurrentUser = user
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme()
  const {top} = useSafeAreaInsets()
  const {width,height} = useWindowDimensions()


  type NavigationProp = {
    ProjectScreen:undefined,
    Welcome:{
      screen?:string
    },
    SecondStack:{
      screen?:string
    },
    Message:undefined,
    Edit:undefined,
    SkillsScreen:undefined,
    ProjectEntryScreen:undefined
  }
  
  type Navigation = NativeStackNavigationProp<NavigationProp>;
  
  
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
  
  const follow_items = [{count:users?.projects,content:' projects'},{count:users?.connection,content:' connection  '},{count:posts.length,content:' posts'}]


  const onRefresh = useCallback(async () => {
    log(crashlytics,'Account Screen: On Refresh')
    setRefreshing(true);
    const userDoc = doc(UsersRef,user.userId)
    try{
      const unsub = onSnapshot( userDoc,
        async (documentSnapshot) =>{
        if(documentSnapshot.exists){
          setUsers(documentSnapshot.data())
          await Promise.all(
            [
            crashlytics.setUserId(user.userId),
            crashlytics.setAttributes({
              id:user.userId
            })
          ])
        }else{
          console.error('No such document')
        }
      },
        (error:unknown | any)=>{
          recordError(crashlytics,error)
          console.error(`No such document ${error.message}`)
          setLoading(false)
        }
      );
      return () => unsub()
      }catch(error:unknown | any){
        recordError(crashlytics,error)
      }finally{
        setRefreshing(false);
      }
  }, [user]);

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    },1000)

    return  () => clearTimeout(timer)
  },[])


  useEffect(() => {
    log(crashlytics,'Account Screen: Grabbing Users Projects')
    if(projects.length === 0) return;
    setLoading(true)
    try{
      const collectionRef = collection(UsersRef,user.userId,'projects')
      const unsub = onSnapshot(collectionRef,async (documentSnapshot) => {
        let data:Project[] = []
        documentSnapshot.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setProjects(data)
        await Promise.all([
          crashlytics.setUserId(user.userId),
          crashlytics.setAttributes({
            user_id:user.userId
          })
        ])
      })
      return () => unsub()
    }catch(err:any){
      recordError(crashlytics,err)
      console.error('error grabbing user post:',err.message)
    }finally{
      setLoading(false)
    }
    
  },[user])

  useEffect(() => {
    log(crashlytics,'Account Screen: Grabbing Users Post')
    setLoading(true)
    try{
      
      const postRef = query(PostRef,where('name','==',user?.username) ,orderBy('createdAt','desc'))
      const unsub = onSnapshot(postRef,async (querySnapshot) => {
        let data:Post[] = []
        querySnapshot.forEach(documentSnapshot => {
          data.push({...documentSnapshot.data(),id:documentSnapshot.id})
        })
        await Promise.all([
          setUserId(crashlytics,user.userId),
          setAttributes(crashlytics,{
            user_id:user.userId
           })
        ])
        setPosts(data)
      })
      return () => unsub()
    }catch(err:any){
      recordError(crashlytics,err)
      console.error('error grabbing user post:',err)
    }finally{
      setLoading(false)
    }
    
  },[user])

  useEffect(() => {
    log(crashlytics,'Account Screen: Grabbing User ')
    setLoading(true)
      const userDoc = doc(UsersRef,user.userId)
      try{
        const unsub = onSnapshot(userDoc,
          async (documentSnapshot) =>{
          if(documentSnapshot.exists){
            setUsers(documentSnapshot.data())
            await Promise.all(
              [
              setUserId(crashlytics,user.userId),
              setAttributes(crashlytics,{
                id:user.userId
              })
            ])
          }else{
            console.error('No such document')
          }
        },
          (error:unknown | any)=>{
            recordError(crashlytics,error)
            console.error(`No such document ${error.message}`)
            setLoading(false)
          }
        );
        return () => unsub()
      }catch(error: unknown | any){
        recordError(crashlytics,error)
      }finally{
        setLoading(false)
      }
  },[])



  const pickImage = async () => {
    log( crashlytics,'Post Screen: Picking Images')
    try{
      let results = await launchImageLibrary({
        mediaType: 'mixed',
        quality:1,
        videoQuality:'high'
      })
      if(!results.didCancel && results.assets?.length && results.assets[0].uri){
        const uri = await ImageCompressor.compress(results.assets[0].uri)
        setImage(uri)
        setFileName(results?.assets[0]?.fileName)
      }
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error(error)
    }
  }
 



  const Post = () => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
        <FlashList
          contentContainerStyle={{padding:0}}
          data={posts}
          estimatedItemSize={460}
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
          renderItem={({item}) => <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
            <PostComponent
            auth_profile={item.auth_profile}
            count={item.like_count}
            url={item.imageUrl}
            id={item.post_id}
            name={item.name}
            content={item.content}
            date={item?.createdAt?.toDate().toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true})}
            comment_count={item.comment_count}/>
            </Suspense>}
          keyExtractor={(item)=> item?.post_id?.toString() || Math.random().toString()}
              />
    </SafeAreaView>
    </View>
    
  ); 
  
  const Projects = () => (
    <View style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
          <FlashList
          contentContainerStyle={{padding:0}}
          estimatedItemSize={460}
          data={projects}
          onRefresh={onRefresh}
          keyExtractor={(item)=> item?.id?.toString() || Math.random().toString()}
          ListEmptyComponent={(item) => (
            <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
              <TouchableOpacity onPress={()=> navigation.navigate('SecondStack',{screen:'ProjectEntryScreen',})}>
              <Text>Enter a Project</Text>
              </TouchableOpacity>
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
            <Text style={{ textAlign: 'center', color: '#fff' }}>{item?.project_name}</Text>
          </View>
          </TouchableOpacity>)}
          />
    </SafeAreaView>
    </View>
  );
  {/** Need to Change this Function to display skills instead for bother Account and Other User Screen */}
  const SkillsScreen = () => (
    <View style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      <FlashList
      data={projects}
      contentContainerStyle={{padding:0}}
      estimatedItemSize={460}
      onRefresh={onRefresh}
      keyExtractor={(item)=> item?.id?.toString() || Math.random().toString()}
      ListEmptyComponent={(item) => (
        <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
           <TouchableOpacity onPress={()=> navigation.navigate('SecondStack',{screen:'SkillScreen',})}>
              <Text>Enter a Skill</Text>
              </TouchableOpacity>
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
          <Text style={{ textAlign: 'center', color: '#fff' }}>{item?.project_name}</Text>
          </View>
          </TouchableOpacity>
          )}
          />
    </SafeAreaView>
    </View>
  );

  return (
  
    <View style={[styles.screen,{backgroundColor:theme.colors.background,paddingTop:Platform.OS === 'ios' ? top: 0}]}>
  <ScrollView
    scrollEnabled={true}
    showsVerticalScrollIndicator={false}
    style={styles.screen}
    contentContainerStyle={{flexGrow:1}}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
    >
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
        />
      </TouchableOpacity>
        <TouchableOpacity style={{alignItems:'flex-end',padding:5}} onPress={() => console.log('button pressed')}>
        <Icon size={hp(3)} source='pencil' color={theme.colors.tertiary}/>
        </TouchableOpacity>
        </View> 
      </ImageBackground>
      <View style={{
        flexDirection:'row',
        paddingLeft:10,
        justifyContent:'space-between',
        padding:5,}}>
      <Image
          style={{height:hp(8), aspectRatio:1, borderRadius:100,borderWidth:2,borderColor:theme.colors.background}}
          source={users?.profileUrl}
          placeholder={{blurhash}}
          cachePolicy='none'/>
        {isCurrentUser &&  <Button 
        onPress={() => navigation.navigate('Welcome',{screen:'Edit'})}
        mode='outlined' style={{
        backgroundColor:'transparent', 
        borderRadius:100,
        borderWidth:1,
        borderColor:theme.colors.tertiary}}>Edit Profile</Button>}
          </View>
          <View style={{marginTop:5}}>
          <View style={{paddingLeft:10,flexDirection:'column'}}>
          <Text
          variant='bodySmall'
          style={{
            color:theme.colors.onTertiary
            }}>@{users?.username}</Text>
              {users?.jobtitle &&   <Text
              variant='bodySmall'
              style={{
                color:theme.colors.onTertiary
              }}>{users?.jobtitle}</Text>}
              {users?.location &&    <Text
              variant='bodySmall'
              style={{
                color:theme.colors.onTertiary
              }}><EvilIcons name='location' size={15} color={theme.colors.onTertiary}/>{users?.location}</Text>}
              <View style={{flexDirection:'row',marginTop:10}}>
              {follow_items.map((item,index)=>{
                  return <FollowComponent key={index} count={item.count} content={item.content}/>
                })}
              </View>
            </View>
          </View>
      <View style={{flex: 1}}>
        <Tab.Navigator
      screenOptions={{
        swipeEnabled:true,
        tabBarIndicatorStyle:{
          backgroundColor:theme.colors.onPrimary
        },
        tabBarStyle:{
          backgroundColor:theme.colors.background
        },
      }}
      >
        <Tab.Screen
          name='Posts'
          component={Post}
          options={{
            tabBarLabelStyle:{
              fontSize:20,
              color:theme.colors.tertiary
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
    </View>
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
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%', // Adjust this to control fade height
  },
})
export default AccountScreen
