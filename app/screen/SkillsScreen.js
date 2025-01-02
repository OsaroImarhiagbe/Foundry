import React,{useState,useEffect} from 'react'
import {View, Text,StyleSheet,Platform,Keyboard,TouchableWithoutFeedback,ScrollView} from 'react-native'
import color from '../../config/color'
import Autocomplete from 'react-native-autocomplete-input'
import {db} from '../../FireBase/FireBaseConfig';
import {getDoc,doc, collection, onSnapshot,query,where } from 'firebase/firestore';
import axios from 'axios'
import {SkillsAPIKEY} from '@env'

const SkillsScreen = () => {
    const [ query, setQuery ] = useState('');
    const [results,setResults] = useState([])
    const [isloading,setLoading] = useState(false)

    // var myHeaders = new Headers();
    // myHeaders.append("apikey", "O8E6hNsJY8OOCd2YO2rFSJwj3R843nw9");

    // var requestOptions = {
    // method: 'GET',
    // redirect: 'follow',
    // headers: myHeaders
    // };

    useEffect(() =>{
      

        const fetchSkills = async () => {
            setLoading(true)
            if(query.trim() == ''){
                setResults([])
                return

            }
            try{
                const res = await axios.get(`https://api.apilayer.com/skills?q=${query}`,{headers:{
                    "apikey": SkillsAPIKEY,
                    "redirect":'follow'
                }})
                console.log(res.data)
                setResults(res.data || [])
            }catch(err){
                console.log(`Error API:${err}`)
                setResults([])
            }finally{
                setLoading(false)
            }
                
        }

        fetchSkills()

    },[query])
    // var myHeaders = new Headers();
    // myHeaders.append("apikey", "O8E6hNsJY8OOCd2YO2rFSJwj3R843nw9");

    // var requestOptions = {
    // method: 'GET',
    // redirect: 'follow',
    // headers: myHeaders
    // };

    // fetch(f`https://api.apilayer.com/skills?q=${query}`, requestOptions)
    // .then(response => response.text())
    // .then(result => console.log(result))
    // .catch(error => console.log('error', error));


   
  return (
          <TouchableWithoutFeedback>
    <View style={styles.screen}>
    <View style={styles.headingContainer}>
        <Text style={styles.headingText}>Skills</Text>
    </View>
    <View style={styles.inputContainer}>
    <Autocomplete
      data={results}
      placeholder='Enter skills...'
      placeholderTextColor='#000'
      containerStyle={{padding:10}}
      value={query}
      onChangeText={(text) => setQuery(text)}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => setQuery(item.name)}>
          <Text>{item.name}</Text>
        </TouchableOpacity>)}
    />

    </View>
   </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
        backgroundColor:color.backgroundcolor,
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    headingContainer:{
        padding:40,
    },
    headingText:{
        color:color.textcolor,
        fontFamily:color.textFont,
        fontSize:30
    },
})

export default SkillsScreen