import React,{useState, useEffect} from 'react'
import {View, Text, SafeAreaView, StyleSheet,FlatList,Image, TouchableOpacity,ActivityIndicator, Platform,StatusBar} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import SearchComponent from '../components/SearchComponent';
import color from '../../config/color';
import { userRef} from '../../FireBase/FireBaseConfig';
import { getDocs,query,where } from "firebase/firestore"; 
import { useNavigation } from '@react-navigation/native';
import { useDispatch,useSelector } from 'react-redux';
import { addsearchID } from '../features/search/searchSlice';
import useDebounce from '../hooks/useDebounce';
import SearchFilter from '../components/SearchFilter';
const SearchScreen = () => {

  
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([]);
  const [isloading,setLoading] = useState(false)
  const navigation = useNavigation();
  const skills_array = useSelector((state) => state.skill.searchedSkills)

  const debouncedsearch = useDebounce(searchQuery,500)
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
      if(skills_array.lenghth > 0){
        const q = query(userRef,where('username', '>=', searchQuery),
        where('username', '<=', searchQuery + '\uf8ff'),
        where('skills','array-contains-any',skills_array))

      }else{
        const q = query(userRef,
          where('username', '>=', searchQuery),
          where('username', '<=', searchQuery + '\uf8ff'))
      }
      const querySnapShot = await getDocs(q)
      let user = [];
      querySnapShot.forEach(doc => {
        user.push({...doc.data(), id:doc.id})
        console.log('search id:',doc.id)
        dispatch(addsearchID({searchID:doc.id}))
      })
      setLoading(false)
      setResults(user);
      setSearchQuery('')
    }catch(error){
      console.error(`Cant find user: ${error}`)

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
               keyExtractor={(item) => item.id}
               renderItem={({item}) =>
                 <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'SearchAccount',params:{userId:item.userId}})}>
                     <View style={{padding:10}}> 
                   <View style={styles.userContainer}>
                 <Image
                 style={styles.image}
                 source={results?.profileUrl}/>
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
    backgroundColor:color.backgroundcolor,
    borderRadius:20

  },
  text:{
    marginLeft:10,
    fontFamily:color.textFont,
    color:color.textcolor

  }
})

export default SearchScreen
