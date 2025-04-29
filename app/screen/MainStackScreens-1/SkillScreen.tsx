import React,{useState,useEffect} from 'react'
import {
    View,
    StyleSheet,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    TouchableOpacity,
    SafeAreaView} from 'react-native'
import Autocomplete from 'react-native-autocomplete-input'
import { useAuth } from '../../Context/authContext'
import {collection, doc, getDoc, updateDoc }from '@react-native-firebase/firestore'
import axios from 'axios'
import { UsersRef } from '../../FirebaseConfig'
import {SkillsAPIKEY,SkillsAPIURL} from '@env'
import { useTheme,Text, Icon } from 'react-native-paper'
import { useNavigation, } from '@react-navigation/native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';


type NavigationProp = {
    navigate(arg0?: string, arg1?: { screen: string; }): unknown;
    Acount:undefined
}

const SkillScreen = () => {
    const [ query, setQuery ] = useState('');
    const [results,setResults] = useState([])
    const [skills,setSkills] = useState<String[]>([])
    const [isloading,setLoading] = useState(false)
    const theme = useTheme()
    const navigation = useNavigation()
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
        const userDoc = doc(UsersRef,user?.userId)
        const docRef = await getDoc(userDoc)
        const userskills = docRef.data()?.skills || []
        try{
            if(!userskills.includes(item)){
                setSkills((prev) => [...prev,item])
                await updateDoc(userDoc,{
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
    <SafeAreaView style={[styles.screen,{backgroundColor:theme.colors.background}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}style={{padding:5}}>
            <Icon
            size={hp(3)}
            source='close'
            />
        </TouchableOpacity>
    <View  style={{padding:20, }}>
        <Text variant='titleLarge' style={{fontSize:24,}}>Add skill</Text>
    </View>
    <View style={{paddingLeft:20,bottom:0}}>
        <Text variant='titleSmall'>Skill*</Text>
    </View>
    <Autocomplete
      data={results}
      placeholder='Enter skills...'
      placeholderTextColor={theme.colors.onTertiary}
      containerStyle={{padding:10,backgroundColor:'transparent'}}
      inputContainerStyle={{
        backgroundColor:'red'
      }}
      value={query}
      onChangeText={(text) => setQuery(text)}
      flatListProps={{
        keyExtractor: (item,index) => index.toString(),
        renderItem: ({ item }) => <TouchableOpacity onPress={() => handleSubmit(item)}>
            <View style={{padding:5}}>
            <Text>{item}</Text>
                </View></TouchableOpacity>
      }}/>
      <View style={{padding:20}}>
        <View style={{backgroundColor:theme.colors.onTertiary,borderWidth:0.5,height:hp(30),borderRadius:5}}>
            <View style={{padding:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <Text>Based off your profile</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}style={{padding:5}}>
                    <Icon
                    size={hp(3)}
                    source='close'
                    />
                </TouchableOpacity>
            </View>
        </View>
      </View>
   </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
    }
})

export default SkillScreen