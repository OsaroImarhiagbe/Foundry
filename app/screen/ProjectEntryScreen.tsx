import React,{useCallback, useState} from 'react'
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  TouchableOpacity} from 'react-native'
import { Button, Icon } from 'react-native-paper';
import {useAuth} from '../authContext';
import { blurhash } from '../../utils';
import { 
  addDoc,
  collection,
  doc,
  FirebaseFirestoreTypes,
  getDoc,
  query,
  Timestamp,
  updateDoc,
  where} from '@react-native-firebase/firestore'
import { Image } from 'expo-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { log,recordError } from '@react-native-firebase/crashlytics'
import { crashlytics, db, UsersRef } from '../../FirebaseConfig';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AppTextInput from 'app/components/AppTextInput';
//import FastImage from "@d11/react-native-fast-image";
import {Image as ImageCompressor} from 'react-native-compressor';
import {launchImageLibrary} from 'react-native-image-picker';
import { useDispatch,useSelector } from 'react-redux';
import { addprojectId } from 'app/features/projects/projectSlice';
import { storage } from '../../FirebaseConfig';
import {getDownloadURL, putFile, ref} from '@react-native-firebase/storage';

const ProjectEntryScreen = () => {
    const [focus,setFocus] = useState('')
    const [text,setText] = useState('')
    const [tech,setTech] = useState('')
    const [projectname,setProjectName] = useState('')
    const [image,setImage] = useState('')
    const [filename,setFileName] = useState<string | undefined>(undefined)
    const projectId = useSelector((state:any) => state.project.projectId )
    const theme = useTheme()
    const {user} = useAuth()
    const navigation = useNavigation()
    const dispatch = useDispatch()

    const pickImage = useCallback(async () => {
      log(crashlytics,'ProjectEntryScreen: Picking Image')
      try{
        let results = await launchImageLibrary({
          mediaType:'photo',
          quality:1
        })
        if(!results.didCancel && results.assets?.length && results.assets[0].uri){
          const uri = await ImageCompressor.compress(results.assets[0].uri)
          setImage(uri)
          setFileName(results?.assets[0]?.fileName)
        }
      }catch(error: unknown | any){
        recordError(crashlytics,error)
        console.error('user cancelled the image picker.')
      }
      },[ setImage, setFileName])

    const handleSubmit = useCallback(async () => {
      log(crashlytics,'ProjectEntryScreen: Handle Submit')
      let url;
      const projectDoc = doc(UsersRef,user?.userId,'projects',projectId)
      const docRef = await getDoc(projectDoc)
      const imageRef = ref(storage,`/users/projects/${user.userId}/${filename}`)
      await putFile(imageRef,image)
      url = await getDownloadURL(imageRef)
      try{
          if(docRef){
            await updateDoc(projectDoc,{
                project_name: projectname,
                image:url,
                content: text,
                technology: [tech],
                createdAt: Timestamp.fromDate(new Date())
            })
            dispatch(addprojectId(projectId))
        }else{
          const projectRef = collection(UsersRef,user.userId,'projects')
          const newDoc = await addDoc(projectRef,{
                project_name: projectname,
                image:url,
                content: text,
                technology: [tech],
                createdAt: Timestamp.fromDate(new Date())
            })
          await updateDoc(newDoc,{
            projectid:newDoc.id
          })
          dispatch(addprojectId(newDoc.id))
        }
        setText('')
        setProjectName('')
        setTech('')
        }catch(error: unknown | any){
          recordError(crashlytics,error)
        }
    },[projectname,text,tech,image,projectId])
  return (
    <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
        <SafeAreaView style={[styles.screen,{backgroundColor:theme.colors.background}]}>
        <View style={{padding:5}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon source='arrow-left-circle' size={25}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
          <MaterialIcons name='camera-alt' size={25} color='#000' />
        </TouchableOpacity>
       </View>
        <View style={styles.imagecontainer}>
        <Image
            style={{width:'100%',height:'100%',borderRadius:20}}
            source={{image}}
            placeholder={{blurhash}}
            />
        </View>
        </View>
        <View style={{padding:20}}>
            <AppTextInput
            values={projectname}
            onChangeText={(text) => setProjectName(text)}
            onFocus={()=>setFocus('projectname')}
            placeholder='Project Name...'
            color={theme.colors.tertiary}/>
            <AppTextInput
            values={text}
            onChangeText={(text) => setText(text)}
            onFocus={()=>setFocus('text')}
            placeholder='Project Overview...'
            color={theme.colors.tertiary}/>
            <AppTextInput
            values={tech}
            onChangeText={(text) => setTech(text)}
            onFocus={()=>setFocus('tech')}
            placeholder='List Tech...'
            color={theme.colors.tertiary}
           />
        </View>
        <View style={{padding:10,marginVertical:10}}>
        <Button mode='outlined' onPress={handleSubmit}>Submit</Button>
        </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
    },
    imagecontainer:{
        justifyContent:'center',
        alignItems:'center',
        marginTop:50,
        backgroundColor:'#3b3b3b',
        borderRadius:20,
        height:250,
    },
})

export default ProjectEntryScreen