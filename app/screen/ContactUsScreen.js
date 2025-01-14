import React from 'react'
import {SafeAreaView,Text,StyleSheet} from 'react-native'
import color from '../../config/color';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const ContactUsScreen = () => {

    const contact = [
        {
            name:'email@gmail.com',
            icon:'email'
        },
        {
            name:'000-000-000',
            icon:'phone'
        },
        {
            name:'PO Box 4848',
            icon:'mailbox'
        }
    ]
  return (
    <SafeAreaView style={styles.screen}>
        <View style={styles.conatiner}>
            <View style={styles.headingContainer}>
            <Text style={styles.headingText}>
                Contact Us
            </Text>
            </View>
            {
                contact.map((contacts,index) =>{
                    return (
                        <View key={index} style={styles.contactContainer}>
                            <MaterialCommunityIcons name={contacts.icon} size={25} color='#fff'/><Text style={styles.contactText}>{contacts.name}</Text>
                        </View>
                    )
                })
            }
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
        backgroundColor:color.backgroundcolor
    },
    conatiner:{
        padding:20
    },
    headingText:{
        color:'#fff',
        fontSize:30,
        fontFamily:'Helvetica-light'
    },
    headingContainer:{
        marginTop:20,
        marginBottom:20
    },
    contactContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        margin:5
    },
    contactText:{
        color:'#fff',
        fontSize:20,
        fontFamily:'Helvetica-light'
    }
})

export default ContactUsScreen