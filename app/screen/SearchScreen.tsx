import React,{useState, useEffect} from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
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
import firestore from '@react-native-firebase/firestore';
import useDebounce from '../hooks/useDebounce';
import SearchFilter from '../components/SearchFilter';




interface Results{
  id?:string,
  username?:string | undefined,
  profileUrl?:string,
}

const SearchScreen = () => {

  
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Results[]>([]);
  const [isloading,setLoading] = useState<boolean>(false)
  const navigation = useNavigation();
  const skills_array = useSelector((state) => state.skill.searchedSkills)

  const debouncedsearch = useDebounce(searchQuery,3000)
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
    setLoading(true)
    if(searchQuery.trim() === '') return;
    try{
      let queryRef = firestore()
      .collection('users')
      .where('username', '>=', searchQuery)
      .where('username', '<=', searchQuery + '\uf8ff')
      if(skills_array.length > 0){
        queryRef = queryRef.where('skills','array-contains-any',skills_array)
      }
      const querySnapShot = await queryRef.get()
      let user:Results[]= []
      querySnapShot.docs.forEach(documentSnapShot => {
        user.push({...documentSnapShot.data(),id:documentSnapShot.id})
        dispatch(addsearchID({searchID:documentSnapShot.id}))
      })
      setResults(user);
      setSearchQuery('')
    }catch(error){
      console.error(`Cant find user: ${error}`)
    }finally{
      setLoading(false)
    }
  }

  return (
    <View style={styles.screen}>
        <View style={{padding:30, marginTop:40,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <SearchComponent 
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
               keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
               renderItem={({item}) =>
                 <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'SearchAccount',params:{userId:item.userId}})}>
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
    backgroundColor:color.backgroundcolor,
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
