import React,{useState,useEffect} from 'react'
import {View, Text,StyleSheet,Platform,Keyboard,TouchableWithoutFeedback,TouchableOpacity,SafeAreaView} from 'react-native'
import color from '../../config/color'
import Autocomplete from 'react-native-autocomplete-input'
import { useAuth } from '../authContext'
import {collection }from '@react-native-firebase/firestore'
import axios from 'axios'
import { db } from 'FIrebaseConfig'
import {SkillsAPIKEY,SkillsAPIURL} from '@env'

const SkillsScreen = () => {
    const [ query, setQuery ] = useState('');
    const [results,setResults] = useState([])
    const [skills,setSkills] = useState<String[]>([])
    const [isloading,setLoading] = useState(false)
    const {user} = useAuth()

  

    useEffect(() =>{
        const fetchSkills = async () => {
            setLoading(true)
            if(query.trim() == ''){
                setResults([])
                return
            }
            try{
                const res = await axios.get(`${SkillsAPIURL}skills?q=${query}`,{headers:{
                    "apikey": SkillsAPIKEY,
                    "redirect":'follow'
                }})
                setResults(res.data || [])
            }catch(err){
                console.error(`Error API:${err}`)
                setResults([])
            }finally{
                setLoading(false)
            }      
        }

        fetchSkills()

    },[query])


    const handleSubmit = async (item:string) => {
        const userDoc = await collection('users').doc(user?.userId).get()
        const userskills = userDoc.data()?.skills || []
        try{
            if(!userskills.includes(item)){
                setSkills((prev) => [...prev,item])
                await collection('users').doc(user.userId).update({
                    skills:[
                        ...skills,
                        item
                        ]
                })
            }
        }catch(err){
            console.error('Error with adding skill:',err)
        }
    }


   
  return (
          <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
    <SafeAreaView style={styles.screen}>
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
        keyExtractor: (item,index) => index.toString(),
        renderItem: ({ item }) => <TouchableOpacity onPress={() => handleSubmit(item)}>
            <View style={{padding:5}}>
            <Text style={{fontSize:20,fontFamily:color.textFont}}>{item}</Text>
                </View></TouchableOpacity>
      }}/>
    </View>
    <View style={{paddingTop:100}}>
        <Text style={styles.headingText}>Skills</Text>
        <View>{skills.map((skill,index) => (
            <View key={index}>
                 <Text style={{color:color.textcolor}}>{skill}</Text>
                </View>
        ))}</View>
    </View>
   </SafeAreaView>
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
    inputContainer:{
        marginBottom:40
    }
})

export default SkillsScreen