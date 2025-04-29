import React,{useState, useEffect, useCallback} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  } from 'react-native';
import SearchComponent from '../../components/SearchComponent/SearchComponent';
import color from '../../../config/color';
import { useNavigation } from '@react-navigation/native';
import {useSelector } from 'react-redux';
import { getDocs, query, where}from '@react-native-firebase/firestore';
import useDebounce from '../../hooks/useDebounce';
import SearchFilter from '../../components/SearchComponent/SearchFilter';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from '../../Context/authContext';
import { crashlytics, UsersRef } from '../../FirebaseConfig';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {log, recordError} from '@react-native-firebase/crashlytics'
import { FlashList } from '@shopify/flash-list';


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

  const debouncedsearch = useDebounce(searchQuery,300)

  useEffect(() => {
    if (debouncedsearch) {
        handleSearch(debouncedsearch);
    } else {
      setResults([]);
    }
}, [debouncedsearch]);

  const handleSearch = useCallback(async (search:string) => {
    log(crashlytics,'Search Screen: Handle Search')
    setLoading(true)
    if(search.trim() === '') return;
    try{
      let queryRef = query(UsersRef, where('username', '>=', search),where('username', '<=', search + '\uf8ff'))
      if(skills_array.length > 0){
        queryRef = query(queryRef,where('skills','array-contains-any',skills_array))
      }
      const querySnapShot = await getDocs(queryRef)
      let user:Results[]= []
      querySnapShot.docs.forEach(documentSnapShot => {
        user.push({...documentSnapShot.data(),id:documentSnapShot.id})
      });
      setResults(user);
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error(`Cant find user: ${error}`)
    }finally{
      setLoading(false)
    }
  },[skills_array])

  return (
    <View style={[styles.screen,{backgroundColor:theme.colors.background}]}>
        <View style={{padding:10, marginTop:50,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <Image
          style={{height:hp(4.3), aspectRatio:1, borderRadius:100,}}
          source={user.profileUrl ? user.profileUrl : require('../assets/user.png')}
          placeholder={{blurhash}}
          />
          <SearchComponent
          title='Search...'
          setSearchQuery={setSearchQuery} 
          backgroundColor={color.grey}
          color='#00bf63'
          onPress={() => handleSearch(searchQuery)}
          searchQuery={searchQuery}/>
          <SearchFilter/>
        </View>
        {isloading ? <ActivityIndicator size='small' color='#fff'/> :
               <FlashList
               data={results}
               estimatedItemSize={460}
               keyExtractor={(item,index) => item.id?.toString() || index.toString()}
               renderItem={({item}) =>
                 <TouchableOpacity onPress={() => 
                  navigation.navigate('Welcome',
                 {screen:'SearchAccount',
                 params:{userId:item.userId}})}>
                  <View style={{padding:5}}> 
                   <View style={[styles.userContainer,{backgroundColor:theme.colors.onTertiary}]}>
                 <Image
                 style={styles.image}
                 source={item.profileUrl ? item.profileUrl : require('../assets/user.png')}/>
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
    borderRadius:20
  },
  text:{
    marginLeft:10,
    fontFamily:color.textFont,
    color:color.textcolor

  }
})

export default SearchScreen
