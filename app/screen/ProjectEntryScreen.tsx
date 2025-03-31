import React,{useCallback, useState,useEffect, useMemo} from 'react'
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  TouchableOpacity} from 'react-native'
import { Button, Icon } from 'react-native-paper';
import {useAuth} from '../authContext';
import { 
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from '@react-native-firebase/firestore'
import { log,recordError } from '@react-native-firebase/crashlytics'
import { crashlytics, ProjectRef} from '../FirebaseConfig';
import { useTheme } from 'react-native-paper';
import { useNavigation,} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppTextInput from 'app/components/AppTextInput';
import FastImage from "@d11/react-native-fast-image";
import {Image as ImageCompressor} from 'react-native-compressor';
import {launchImageLibrary} from 'react-native-image-picker';
import { useDispatch,useSelector } from 'react-redux';
import { addprojectId,currentProjectId } from 'app/features/projects/projectSlice';
import { storage,functions } from '../FirebaseConfig';
import {getDownloadURL, putFile, ref} from '@react-native-firebase/storage';
import { httpsCallable } from '@react-native-firebase/functions';
import { Text } from 'react-native-paper';


type NavigationProp ={
  Home?:{
    screen?:string
  }
}

type Navigation = NativeStackNavigationProp<NavigationProp>
interface Form {
  Name:string | undefined,
  Overview:string | undefined,
  Tech:string[] | string,
}
interface Item {
  id:string,
  name:keyof Form,
}
const FormData:Item[] = [
  {
    id:'1',
    name:'Name'
  },
  {
    id:'2',
    name:'Overview'
  },
  {
    id:'3',
    name:'Tech'
  }
]

interface Project {
  id?:string,
  Name?:string,
  Overview?:string,
  Tech?:string[],
  projectid?:string
}

const ProjectEntryScreen = () => {
    const [focus,setFocus] = useState('')
    const [image,setImage] = useState('')
    const [loading,setLoading] = useState<boolean>(false)
    const [filename,setFileName] = useState<string | undefined>(undefined)
    const [form,setForm] = useState<Form>({
      Name:'',
      Overview:'',
      Tech:['']
    })
    const projectId = useSelector((state:any) => state.project.projectid)
    const currentProjectId = useSelector((state:any) => state.project.currentProjectId)
    const theme = useTheme()
    const {user} = useAuth()
    const navigation = useNavigation<Navigation>()
    const dispatch = useDispatch()

    useEffect(() => {
      setLoading(true)
      log(crashlytics,'ProjectEntryScreen')
      try{
        const docRef = collection(ProjectRef,user.userId,'projects')
        const queryDoc = query(docRef,where('projectid','in',projectId));
        const unsub = onSnapshot(queryDoc,async (documentSnapShot) => {
          if(!documentSnapShot || documentSnapShot.empty){
            setForm({
              Name:'',
              Overview:'',
              Tech:['']
            })
            setLoading(false)
            return;
          }
          let data:Project[] = []
          documentSnapShot.forEach((doc) => {
            data.push({...doc.data(),id:doc.id})
          })
          setForm({
            Name:data[0].Name,
            Overview:data[0].Overview,
            Tech:data[0].Tech || []
          })
          dispatch(currentProjectId({id:data[0].projectid}))
          setLoading(false)
        })
        return () => unsub()
      }catch(error:unknown | any){
        recordError(crashlytics,error)
      }
    },[])

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
      const addProject = httpsCallable(functions,'addProject')
      const imageRef = ref(storage,`/users/projects/${user.userId}/${filename}`)
      await putFile(imageRef,image)
      url = await getDownloadURL(imageRef)
      try{
        const results = await addProject({
          ...form,
          currentProjectId:currentProjectId,
          image:url,
        })
        dispatch(addprojectId({id:(results.data as {projectid:string}).projectid}))
      }catch(error: unknown | any){
          recordError(crashlytics,error)
        }
    },[form, image, filename, currentProjectId,projectId])
  return (
    <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
        <SafeAreaView style={[styles.screen,{backgroundColor:theme.colors.background}]}>
        <View style={{padding:5}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',padding:5}}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon source='arrow-left-circle' size={25}/>
          </TouchableOpacity>
          <Text
          variant='titleLarge'
          style={{
            color:theme.colors.tertiary
          }}
          >Project Entry</Text>
          <TouchableOpacity onPress={pickImage}>
          <Icon source='camera' size={25}/>
        </TouchableOpacity>
       </View>
       <FastImage
          source={{
            uri:image,
            priority:FastImage.priority.normal
          }}
          resizeMode={FastImage.resizeMode.cover}
          style={{
            aspectRatio: 1,
            width:370,
            alignSelf:'center',
            marginTop:30,
            backgroundColor:'#3b3b3b',
            borderRadius:20,
            height:370,
        }}/>
       </View>
        <View style={{padding:20}}>
          {
            FormData.map(({name,id}) => (
              <AppTextInput
              key={id}
              values={Array.isArray(form[name]) ? form[name].join(', ') : form[name]}
              onChangeText={(text) => setForm({...form, [name]:text})}
              onFocus={()=>setFocus(name)}
              placeholder={name}
              placeholderColor='#8a8a8a'
              color={theme.colors.tertiary}/>
            ))
          }
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