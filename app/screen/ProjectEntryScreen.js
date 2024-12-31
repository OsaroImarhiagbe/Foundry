import React,{useState} from 'react'
import {View,Text,StyleSheet,TextInput,Image, TouchableWithoutFeedback,Keyboard, KeyboardAvoidingView} from 'react-native'
import color from '../../config/color'
//import profile from '../assets/profile.jpg'
import {db} from '../../FireBase/FireBaseConfig';
import {getDoc,doc, collection, onSnapshot,query,where,setDoc,Timestamp,updateDoc } from 'firebase/firestore';
import Button from '../components/Button';
import {useAuth} from '../authContext';
import { blurhash } from '../../utils';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const ProjectEntryScreen = () => {
    const [focus,setFocus] = useState('')
    const [text,setText] = useState('')
    const [skills,setSkills] = useState('')
    const [projectname,setProjectName] = useState('')
    const {user} = useAuth()


    // const uploadtoS3 = async (image) => {
    //     try{
    //       const formData = new FormData()
    //       formData.append('file',{
    //         uri: image,
    //         type: "image/jpeg",
    //         name: "photo.jpg"
    //     })
    //       const uploadResponse = await axios.post('http://192.168.1.253:8000/api/media_files/',formData,{
    //         headers:{
    //           'Content-Type':'multipart/form-data'
    //         }
    //       })
    //       if(uploadResponse.status === 201){
    //         console.log('file uploaded to s3')
    //         return uploadResponse.data.file
    //       }else{
    //         console.log('Failed to upload to s3')
    //       }
    //     }catch(err){
    //       console.log('Error uploading to s3:',err)
    //     }
    //   }
    
    //   const pickImage = async () => {
    //     let results = await ImagePicker.launchImageLibraryAsync({
    //       mediaTypes: ['images', 'videos'],
    //       allowsEditing:true,
    //       quality:1
    //     })
    //     console.log('Image results:',results)
    //     if(!results.canceled){
    //       setImage(results.assets[0].uri)
    //     }else{
    //       console.log('user cancelled the image picker.')
    //     }
    //   }

    const handleSubmit = async () => {
        const docRef = doc(db,'projects',user.userId)
        const docSnap = await getDoc(docRef)
        if(docSnap.exists()){
            await updateDoc(docRef,{
                id:user.userId,
                projects:[
                    {
                        projectLogo:'',
                        projectUrl:'',
                        project_name:projectname,
                        content:text,
                        skills:[{
                            skill:skills
                        }],
                        createdAt:Timestamp.fromDate(new Date())
                    }],
            })
        }else{
            const data = docSnap.data();
            const existingProjects = data.projects || [];
            await setDoc(docRef,{
                id:user.userId,
                projects:[
                    ...existingProjects,
                    {
                        project_name:projectname,
                        content:text,
                        skills:[{
                            skill:skills
                        }],
                        createdAt:Timestamp.fromDate(new Date())
                    }],
            })
        }
        setText('')
        setProjectName('')
        setSkills('')
    }
  return (
    <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
        <View style={styles.screen}>
        <View style={{padding:10}}>
        <View style={styles.imagecontainer}>
        <Image
            style={{width:'100%',height:'100%',borderRadius:20}}
            source={blurhash ||profile }
            />
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
        <Button title='Submit' onPress={handleSubmit}/>
        </View>
    </View>
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
        
    }
})

export default ProjectEntryScreen