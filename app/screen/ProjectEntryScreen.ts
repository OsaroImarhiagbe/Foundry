import React,{useState} from 'react'
import {View,StyleSheet,TextInput,TouchableWithoutFeedback,Keyboard,SafeAreaView} from 'react-native'
import color from '../../config/color'
import Button from '../components/Button';
import {useAuth} from '../authContext';
import { blurhash } from '../../utils';
import firestore from '@react-native-firebase/firestore'
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ProjectEntryScreen = () => {
    const [focus,setFocus] = useState('')
    const [text,setText] = useState('')
    const [skills,setSkills] = useState('')
    const [projectname,setProjectName] = useState('')
    const [image,setImage] = useState('')
    const [project_id,setProject_id] = useState('')
    const {user} = useAuth()


    const uploadtoS3 = async (image) => {
        try{
          const formData = new FormData()
          formData.append('file',{
            uri: image,
            type: "image/jpeg",
            name: "photo.jpg"
        })
        formData.append('project_id', project_id)
          const uploadResponse = await axios.post(DJANGO_PROJECT_URL,formData,{
            headers:{
              'Content-Type':'multipart/form-data'
            }
          })
          if(uploadResponse.status === 201){
            console.error('file uploaded to s3')
            return uploadResponse.data.file
          }else{
            console.error('Failed to upload to s3')
          }
        }catch(err){
          console.error('Error uploading to s3:',err)
        }
      }
    
      const pickImage = async () => {
        let results = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images', 'videos'],
          allowsEditing:true,
          quality:1
        })
        console.error('Image results:',results)
        if(!results.canceled){
          setImage(results.assets[0].uri)
        }else{
          console.error('user cancelled the image picker.')
        }
      }

    const handleSubmit = async () => {
        const docRef = await firestore().collection('users').doc(user?.userId).collection('projects')
        const projectSnapshot = await docRef.where('project_name', '==', projectname).get();
        let imageUrl = null;
        if(image){
            imageUrl = await uploadtoS3(image)
        }
        if(projectSnapshot.exists()){
            await firestore()
            .collection('users')
            .doc(user?.userId)
            .collection('projects')
            .update({
                project_name: projectname,
                image:imageUrl,
                content: text,
                skills: [{
                    skill: skills
                }],
                createdAt: Timestamp.fromDate(new Date())
            })
            setProject_id(projectSnapshot.id)
        }else{
           const newDoc = await firestore()
            .collection('users')
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
        <Button title='Submit' onPress={handleSubmit}/>
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