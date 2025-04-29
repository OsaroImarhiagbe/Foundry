import React,{useState,useEffect} from 'react'
import {View,Text,StyleSheet, TouchableOpacity,SafeAreaView} from 'react-native'
import color from '../../../config/color';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import {collection, getDocs, query, where} from '@react-native-firebase/firestore'
import { useAuth } from '../../Context/authContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import  { log, recordError } from '@react-native-firebase/crashlytics'
import { crashlytics,ProjectRef } from '../../FirebaseConfig';
import FastImage from '@d11/react-native-fast-image';
import { useSelector } from 'react-redux';
import { useTheme } from 'react-native-paper';

interface Project{
    id?:string,
    Name?:string,
    Overview?:string,
    Tech?:string[]
    image?:string
}
type RootStackListProp = {
    ProjectEntryScreen:undefined
}

type NavigationProp = NativeStackNavigationProp<RootStackListProp,'ProjectEntryScreen'>
const ProjectScreen = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const {user} = useAuth()
    const theme = useTheme();
    const projectId = useSelector((state:any) => state.project.projectid)

    const navigation = useNavigation<NavigationProp>()


    useEffect(() => {
       log(crashlytics,'Project Screen: Grabbing Projects')
       const getProject = async () => {
        try{
            const docRef = collection(ProjectRef,user.userId,'projects')
            const q = query(docRef,where('projectid', 'in', projectId))
            const querySnapShot = await getDocs(q)
            const queryDocument = querySnapShot.docs.map((doc) => ({
                id:doc.id,
                ...doc.data()
            }))
            setProjects(queryDocument)
        }catch(error: unknown | any){
            recordError(crashlytics,error)
        }
       }
       getProject()
    },[])

    return (
      <SafeAreaView style={[styles.screen,{backgroundColor:theme.colors.background}]}>
        <View style={{padding:20}}>
        <View style={styles.container}>
            {projects[0].image ?
              <FastImage
              style={{width:'100%',height:'100%',borderRadius:20}}
              source={{
                uri:projects[0]?.image,
                priority:FastImage.priority.normal
            }}
              resizeMode={FastImage.resizeMode.cover}
              /> : <View style={{justifyContent:'center',alignItems:'center'}}><Text>Upload Image</Text></View>
            }
        </View>
        </View>
        <View style={{padding:20}}>
            <View style={{justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
            <Text style={styles.textHeading}>Project Overview</Text>
            <TouchableOpacity style={{ backgroundColor: '#3b3b3b', borderRadius: 5, width: 40, padding: 5 }} onPress={() => navigation.navigate('ProjectEntryScreen')}>
                <View style={{ alignItems: 'center'}}>
                <FontAwesome5 name='project-diagram' size={20} color='#00bf63' />
                </View>
            </TouchableOpacity>
            </View>
            <View style={styles.textcontainer}>
                {
                    projects.length > 0 ? <Text style={styles.text}>{projects[0]?.Overview}
                </Text>  : <Text style={styles.text}> Enter Details about your project</Text>
                }
            </View>
            <View style={{marginTop:20}}>
            <Text style={styles.textHeading}>Tech Used</Text>
            <View style={{padding:10}}>
            {projects[0]?.Tech?.map((tech,index)=>{
                return (
                    <View style={{marginTop:5}}  key={index}>
                        <Text style={styles.text}>
                            <Entypo name='code' size={15}/>{tech}</Text>
                        </View>
                )
            })}
            </View>
            </View>
        </View>
      </SafeAreaView>
    )
  }





const styles = StyleSheet.create({
    screen:{
        flex:1,
    },
    container:{
        justifyContent:'center',
        alignItems:'center',
        marginTop:30,
        backgroundColor:'#3b3b3b',
        borderRadius:20,
        height:250
    },
    text:{
        color:'#fff',
        fontFamily:color.textFont,
        fontSize:15,
        textAlign:'left'
    },
    textHeading:{
        color:'#fff',
        fontSize:30,
        fontFamily:color.textFont
    },
    textcontainer:{
        marginTop:10,
        padding:10

    }
})

export default ProjectScreen