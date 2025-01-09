import React,{useState,useEffect} from 'react'
import {View,Text,StyleSheet, TouchableOpacity} from 'react-native'
import color from '../../config/color';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import {db} from '../../FireBase/FireBaseConfig';
import {collection, onSnapshot,query,where} from 'firebase/firestore';
import { useAuth } from '../authContext';
import { Image } from 'expo-image';
import { blurhash } from '../../utils';

const ProjectScreen = () => {
    const [projects, setProjects] = useState('')
    const {user} = useAuth()

    const navigation = useNavigation()


    useEffect(() => {
        const getProject = () => {
            const docRef = collection(db, 'users', user.userId, 'projects');
            const projectQuery = query(docRef, where('project_name', '==', projectname));
            const unsub = onSnapshot(projectQuery,(snapShot)=>{
                let data = []
                snapShot.forEach((doc) => {
                    data.push({...doc.data(),id:doc.id})
                })
                setProjects([...data])
            })
            return unsub
        }
        getProject()
    },[user])

    return (
      <View style={styles.screen}>
        <View style={{padding:20}}>
        <View style={styles.container}>
            <Image
            style={{width:'100%',height:'100%',borderRadius:20}}
            source={projects?.image}
            placeholder={{blurhash}}
            />
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
                    projects ? <Text style={styles.text}>{projects.content}
                </Text>  : <Text style={styles.text}> Enter Details about your project</Text>
                }
            </View>
            <View style={{marginTop:20}}>
            <Text style={styles.textHeading}>Tech Used</Text>
            <View style={{padding:10}}>
            {projects.skills.map((project,index)=>{
                return (
                    <View style={{marginTop:5}}  key={index}>
                        <Text style={styles.text}>
                            <Entypo name='code' size={15}/> {project.skill}</Text>
                        </View>
                )
            })}
            </View>
            </View>
        </View>
      </View>
    )
  }





const styles = StyleSheet.create({
    screen:{
        flex:1,
        backgroundColor:color.backgroundcolor,
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