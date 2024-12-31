import React,{useState,useEffect} from 'react'
import {View,Text,StyleSheet, TouchableOpacity,Image} from 'react-native'
import color from '../../config/color';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import {db} from '../../FireBase/FireBaseConfig';
import {getDoc,doc, collection, onSnapshot,query,where,setDoc,Timestamp,updateDoc } from 'firebase/firestore';
import profile from '../assets/profile.jpg'

const ProjectScreen = () => {
    const skills = ['Python','react','react native','Javascript','SQL','HTML/CSS','Linux','Django']
    const [text, setText] = useState('')

    const navigation = useNavigation()


    // useEffect(() => {

    // })

    return (
      <View style={styles.screen}>
        <View style={{padding:20}}>
        <View style={styles.container}>
            <Image
            style={{width:'100%',height:'100%',borderRadius:20}}
            source={profile}
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
                    text ? <Text style={styles.text}>fjkfkfnkdnffmsfnlsandjadm;asndjksdfsdmfdkosdndlasnfkamdansdlasmdlamsdamsd;amsdklasfdsfksakdjassandkjas rekrbkwebrjewb
                    fkbsdf sdjkf sjkfn ksj fa dka djla dfl fjdf jdf d fjekw fje nwfs adfjs f njfbqjfn   'finallyekwnguj enwfkjbew sdfjbewjknsfj webnfklnewsdjf
                    fjewdf jewq fqew fo;ew qkfnew;nsfojebwfjewbnfmwepf'
                </Text>  : <Text style={styles.text}> Enter Details about your project</Text>
                }
            </View>
            <View style={{marginTop:20}}>
            <Text style={styles.textHeading}>Tech Used</Text>
            <View style={{padding:10}}>
            {skills.map((skill,index)=>{
                return (
                    <View style={{marginTop:5}}  key={index}>
                        <Text style={styles.text}>
                            <Entypo name='code' size={15}/> {skill}</Text>
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
        fontFamily:'Helvetica-light',
        fontSize:15,
        textAlign:'left'
    },
    textHeading:{
        color:'#fff',
        fontSize:30,
        fontFamily:'Helvetica-light'
    },
    textcontainer:{
        marginTop:10,
        padding:10

    }
})

export default ProjectScreen