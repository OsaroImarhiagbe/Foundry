import React from 'react';
import { View, StyleSheet} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {Text,useTheme} from 'react-native-paper'
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
interface Messageitem{
    message_text?:any,
    current_User?:any,
    date?:any,
    id?:string
}

const MessageItem:React.FC<Messageitem> = ({ message_text, current_User,date,id}) => {
    const theme = useTheme()
    const {user} = useAuth()
    
    if (current_User?.userId != id) {
        return (
            
            <View style={styles.container}>
                <View style={{width:wp('40%')}}>
                    <View style={[styles.textContainer,{backgroundColor:'rgb(70, 160, 250)'}]}>
                    <Text
                    variant='bodySmall'
                     style={{color:theme.colors.tertiary,textAlign:'auto'}}>{message_text}</Text>
                    </View>
                    <Text
                     variant='bodySmall'
                    style={[styles.time,{color:theme.colors.tertiary}]}>{date}</Text>
                </View>
            </View>
        );
    } else {
        return (
            <View style={[styles.leftcontainer]}>
             <View style={{flexDirection:'column',marginBottom:5}}>
             <Image
                 placeholder={{blurhash}}
                 source={{uri:user?.profileUrl}}
                 style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
                />
                <Text
                variant='bodySmall'
                style={[styles.lefttime,{color:theme.colors.tertiary}]}>{date}</Text>
                </View> 
                <View style={{width:wp('40%')}}>
                <View style={[styles.lefttextcontainer, { backgroundColor:'rgb(196, 196, 196)'}]}>  
                <Text
                    variant='bodySmall'
                    style={{textAlign:'auto'}}>{message_text}</Text>   
                </View>
                </View> 
            </View>
           
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 1,
        paddingRight:5,
    },
    textContainer: {
        padding:5,
        borderRadius: 10,
        alignSelf:'flex-end',
        marginBottom:5,
        marginTop:5
    },
    leftcontainer: {
        marginLeft:1,
        flexDirection:'row'
    },
    lefttextcontainer: {
        padding:5,
        alignSelf:'flex-start',
        borderRadius:10,
    },
    time:{
        fontSize:8,
        alignSelf:'flex-end',
        marginTop:5,
        paddingLeft:5,

    },
    lefttime:{
        fontSize:8,
        marginTop:5,
        paddingLeft:5,
    }
});

export default MessageItem;


