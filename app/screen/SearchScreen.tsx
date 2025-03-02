import React,{useState, useEffect} from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  } from 'react-native';
import SearchComponent from '../components/SearchComponent';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import { useDispatch,useSelector } from 'react-redux';
import { addsearchID } from '../features/search/searchSlice';
import { getDocs, query, where}from '@react-native-firebase/firestore';
import useDebounce from '../hooks/useDebounce';
import SearchFilter from '../components/SearchFilter';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
import { crashlytics, UsersRef } from 'FIrebaseConfig';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {log, recordError} from '@react-native-firebase/crashlytics'


interface Results{
  userId?:string;
  id?:string,
  username?:string | undefined,
  profileUrl?:string,
}

type NavigationProp = {
  Welcome: {
    screen: string;
    params: {
      userId?: string;
    };
  };
}

type Navigation = NativeStackNavigationProp<NavigationProp>;

const SearchScreen = () => {

  
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Results[]>([]);
  const [isloading,setLoading] = useState<boolean>(false)
  const navigation = useNavigation<Navigation>();
  const skills_array = useSelector((state:any) => state.skill.searchedSkills)
  const theme = useTheme()
  const {user} = useAuth()

  const debouncedsearch = useDebounce(searchQuery,5000)
  const dispatch = useDispatch()

  useEffect(() => {
    if (debouncedsearch) {
        setLoading(true);
        handleSearch();
    } else {
      setResults([]);
    }
}, [debouncedsearch]);

  const handleSearch = async () => {
    log(crashlytics,'Search Screen: Handle Search')
    setLoading(true)
    if(searchQuery.trim() === '') return;
    try{
      let queryRef = query(UsersRef, where('username', '>=', searchQuery),where('username', '<=', searchQuery + '\uf8ff'))
      if(skills_array.length > 0){
        queryRef = query(queryRef,where('skills','array-contains-any',skills_array))
      }
      const querySnapShot = await getDocs(queryRef)
      let user:Results[]= []
      querySnapShot.docs.forEach(documentSnapShot => {
        user.push({...documentSnapShot.data(),id:documentSnapShot.id})
        dispatch(addsearchID({searchID:documentSnapShot.id}))
      })
      setResults(user);
      setSearchQuery('')
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error(`Cant find user: ${error}`)
    }finally{
      setLoading(false)
    }
  }

  return (
    <View style={[styles.screen,{backgroundColor:theme.colors.background}]}>
        <View style={{padding:10, marginTop:50,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Image
          style={{height:hp(4.3), aspectRatio:1, borderRadius:100,}}
          source={{uri:user.profileUrl}}
          placeholder={{blurhash}}
          />
          <SearchComponent
          title='Search...'
          setSearchQuery={setSearchQuery} 
          backgroundColor={color.grey}
          color='#00bf63'
          onPress={handleSearch}
          searchQuery={searchQuery}/>
          <SearchFilter/>
        </View>
        {isloading ? <ActivityIndicator size='small' color='#fff'/> :
               <FlatList
               data={results}
               keyExtractor={(item) => item?.userId?.toString() || Math.random().toString()}
               renderItem={({item}) =>
                 <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'SearchAccount',params:{userId:item?.userId}})}>
                     <View style={{padding:10}}> 
                   <View style={styles.userContainer}>
                 <Image
                 style={styles.image}
                 source={{uri:item?.profileUrl}}/>
               <Text style={styles.text}>{item.username}</Text>
             </View>
             </View>
                 </TouchableOpacity>
               
               }
               /> }
    </View>
  
  )
}

const styles = StyleSheet.create({
  screen:{
    flex:1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
  },
  image:{
    width:50,
    height:50,
    borderRadius:100
  },
  userContainer:{
    padding:10,
    flexDirection:'row',
    backgroundColor:'#00bf63',
    borderRadius:20

  },
  text:{
    marginLeft:10,
    fontFamily:color.textFont,
    color:color.textcolor

  }
})

export default SearchScreen
