import React,{useState} from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  TouchableOpacity} from 'react-native'
import color from '../../config/color'
import { Button } from 'react-native-paper';
import {useAuth} from '../authContext';
import { blurhash } from '../../utils';
import { 
  collection,
  FirebaseFirestoreTypes,
  Timestamp} from '@react-native-firebase/firestore'
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import crashlytics, { crash } from '@react-native-firebase/crashlytics'
import { db } from 'FIrebaseConfig';
const ProjectEntryScreen = () => {
    const [focus,setFocus] = useState('')
    const [text,setText] = useState('')
    const [skills,setSkills] = useState('')
    const [projectname,setProjectName] = useState('')
    const [image,setImage] = useState('')
    const [project_id,setProject_id] = useState('')
    const {user} = useAuth()

    const pickImage = async () => {
      crashlytics().log('ProjectEntryScreen: Picking Image')
      try{
        let results = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images', 'videos'],
          allowsEditing:true,
          quality:1
        })
        console.error('Image results:',results)
        if(!results.canceled){
          setImage(results.assets[0].uri)
        }
      }catch(error: unknown | any){
        crashlytics().recordError(error)
        console.error('user cancelled the image picker.')
      }
      }

    const handleSubmit = async () => {
      crashlytics().log('ProjectEntryScreen: Handle Submit')
        const docRef = collection(db,'users').doc(user?.userId).collection('projects')
        const projectDoc = await docRef.where('project_name', '==', projectname).get();
        let imageUrl = null;
        try{
          if(projectDoc){
          const projectref = projectDoc.docs[0]
          const projectId = projectref.id
            await collection(db,'users')
            .doc(user?.userId)
            .collection('projects')
            .doc(projectId)
            .update({
                project_name: projectname,
                image:imageUrl,
                content: text,
                skills: [{
                    skill: skills
                }],
                createdAt: Timestamp.fromDate(new Date())
            })
            setProject_id(projectId)
        }else{
           const newDoc = await collection(db,'users')
            .doc(user?.userId)
            .collection('projects')
            .add({
                project_name: projectname,
                image:imageUrl,
                content: text,
                skills: [{ skill: skills }],
                createdAt: Timestamp.fromDate(new Date())
            })
            setProject_id(newDoc.id)
        }
        setText('')
        setProjectName('')
        setSkills('')
        }catch(error: unknown | any){
          crashlytics().recordError(error)
        }
    }
  return (
    <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
        <SafeAreaView style={styles.screen}>
        <View style={{padding:10}}>
        <View style={styles.imagecontainer}>
        <Image
            style={{width:'100%',height:'100%',borderRadius:20}}
            source={{image}}
            placeholder={{blurhash}}
            />
        </View>
        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',padding:10}}>
          <TouchableOpacity style={styles.uploadImageButton} onPress={pickImage}>
          <MaterialIcons name='camera-alt' size={15} color='#fff' />
        </TouchableOpacity>
       </View>
        </View>
        <View style={{padding:10}}>
        <View style={[styles.textcontainer,{borderColor:focus === 'projectname' ? '#00BF63' : '#8a8a8a',marginBottom:10}]}>
            <TextInput
            value={projectname}
            onChangeText={(text) => setProjectName(text)}
            onFocus={()=>setFocus('projectname')}
            placeholder='Project Name...'
            placeholderTextColor='#fff'/>
        </View>
        <View style={[styles.textcontainer,{borderColor:focus === 'text' ? '#00BF63' : '#8a8a8a'}]}>
            <TextInput
            value={text}
            onChangeText={(text) => setText(text)}
            onFocus={()=>setFocus('text')}
            placeholder='Project Overview...'
            placeholderTextColor='#fff'
            multiline={true}/>
        </View>
        <View style={[styles.textcontainer,{borderColor:focus === 'skills' ? '#00BF63' : '#8a8a8a',marginTop:10}]}>
            <TextInput
            value={skills}
            onChangeText={(text) => setSkills(text)}
            onFocus={()=>setFocus('skills')}
            placeholder='List skills...'
            placeholderTextColor='#fff'
            multiline={true}
            scrollEnabled={true}/>
        </View>
        </View>
        <View style={{padding:50}}>
        <Button onPress={handleSubmit}>Submit</Button>
        </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
        backgroundColor:color.backgroundcolor
    },
    imagecontainer:{
        justifyContent:'center',
        alignItems:'center',
        marginTop:50,
        backgroundColor:'#3b3b3b',
        borderRadius:20,
        height:250,
    },
    textcontainer:{
        padding:20,
        borderRadius:20,
        backgroundColor:'#3b3b3b',
        borderWidth:2,
        
    },
    uploadImageButton: {
        position: 'absolute',
        backgroundColor: '#00bf63',
        padding: 12,
        alignItems: 'center',
        borderRadius:50,
        justifyContent:'center',
        top:5
      },
})

export default ProjectEntryScreen