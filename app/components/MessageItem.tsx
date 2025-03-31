import React from 'react';
import { View, StyleSheet} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {Text,useTheme} from 'react-native-paper'
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from 'app/authContext';
interface Messageitem{
    message_text?:string,
    current_User?:any,
    date?:string,
    recipient_id?:string
}

const MessageItem:React.FC<Messageitem> = ({ message_text, current_User,date,recipient_id}) => {
    const theme = useTheme()
    const {user} = useAuth()
    
    if (current_User?.userId != recipient_id) {
        return (
            
            <View style={styles.container}>
                <View style={{width:wp('40%')}}>
                    <View style={[styles.textContainer,{backgroundColor:'rgb(70, 160, 250)'}]}>
                    <Text
                    variant='bodyLarge'
                     style={{color:theme.colors.tertiary,textAlign:'auto'}}>{message_text}</Text>
                    </View>
                    <Text
                     variant='bodyLarge'
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
                 source={user?.profileUrl ? user.profileUrl : require('../assets/user.png')}
                 style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
                />
                </View> 
                <View style={{width:wp('40%')}}>
                <View style={[styles.lefttextcontainer, { backgroundColor:'rgb(51, 51, 51)'}]}>  
                <Text
                    variant='bodyLarge'
                    style={{textAlign:'center',color:'#fff'}}>{message_text}</Text>   
                </View>
                <Text
                variant='bodySmall'
                style={[styles.lefttime,{color:theme.colors.tertiary}]}>{date}</Text> 
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
        flexDirection:'row',
    },
    lefttextcontainer: {
        padding:5,
        alignSelf:'flex-start',
        borderRadius:10,
        marginLeft:10
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


