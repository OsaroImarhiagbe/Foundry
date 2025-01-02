import React,{useState,useEffect} from 'react'
import {View, Text,StyleSheet,Platform,Keyboard,TouchableWithoutFeedback,TouchableOpacity} from 'react-native'
import color from '../../config/color'
import Autocomplete from 'react-native-autocomplete-input'
import {db} from '../../FireBase/FireBaseConfig';
import {getDoc,doc, collection, onSnapshot,query,where } from 'firebase/firestore';
import axios from 'axios'
import {SkillsAPIKEY} from '@env'

const SkillsScreen = () => {
    const [ query, setQuery ] = useState('');
    const [results,setResults] = useState([])
    const [skills,setSkills] = useState([])
    const [isloading,setLoading] = useState(false)

  

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


    const handleSubmit = (item) => {
        setSkills(item)
    }

   
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
      containerStyle={{padding:30}}
      value={query}
      onChangeText={(text) => setQuery(text)}
      flatListProps={{
        keyExtractor: (item) => Math.random(),
        renderItem: ({ item }) => <TouchableOpacity onPress={() => handleSubmit(item)}>
            <View style={{padding:5}}>
            <Text style={{fontSize:20,fontFamily:color.textFont}}>{item}</Text>
                </View></TouchableOpacity>
      }}/>
    </View>
    <View style={{paddingTop:100}}>
        <Text>Skills</Text>
        <View>{skills.map((skill,index) => (
            <View key={index}>
                 <Text>{skill}</Text>
                </View>
        ))}</View>
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