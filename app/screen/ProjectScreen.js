import React from 'react'
import {View,Text,StyleSheet} from 'react-native'
import color from '../../config/color';
import Entypo from 'react-native-vector-icons/Entypo';


const ProjectScreen = () => {
    const skills = ['Python','react','react native','Javascript','SQL','HTML/CSS','Linux','Django']
    return (
      <View style={styles.screen}>
        <View style={{padding:20}}>
        <View style={styles.container}>
            <Text>Project Image Here</Text>
        </View>
        </View>
        <View style={{padding:20}}>
            <Text style={styles.textHeading}>Project Overview</Text>
            <View style={styles.textcontainer}>
                <Text style={styles.text}>fjkfkfnkdnffmsfnlsandjadm;asndjksdfsdmfdkosdndlasnfkamdansdlasmdlamsdamsd;amsdklasfdsfksakdjassandkjas rekrbkwebrjewb
                    fkbsdf sdjkf sjkfn ksj fa dka djla dfl fjdf jdf d fjekw fje nwfs adfjs f njfbqjfn   'finallyekwnguj enwfkjbew sdfjbewjknsfj webnfklnewsdjf
                    fjewdf jewq fqew fo;ew qkfnew;nsfojebwfjewbnfmwepf'
                </Text>
            </View>
            <View style={{marginTop:20}}>
            <Text style={styles.textHeading}>Tech Used</Text>
            <View style={{padding:10}}>
            {skills.map((skill,index)=>{
                return (
                    <View style={{marginTop:5}}>
                        <Text style={styles.text} key={index}>
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
        padding:40,
        borderRadius:20
    },
    text:{
        color:'#fff',
         fontFamily:'Helvetica-light',
         fontSize:15
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