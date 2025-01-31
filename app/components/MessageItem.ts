import React from 'react';
import { View, StyleSheet} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import color from '../../config/color';
import {Text} from 'react-native-paper'

const MessageItem = ({ message_text, current_User,date,id}) => {
    
    if (current_User?.userId !== id) {
        return (
            
            <View style={styles.container}>
                <View style={{width:wp(70)}}>
                    <View style={[styles.textContainer,{backgroundColor:'#6A1B9A'}]}>
                    <Text
                    variant='bodySmall'
                     style={{fontSize:hp(1.5),color:'#fff',textAlign:'auto'}}>{message_text}</Text>
                    </View>
                    <Text
                     variant='bodySmall'
                    style={styles.time}>{date}</Text>
                </View>
            </View>
        );
    } else {
        return (
            <View style={[styles.leftcontainer, , {width:wp(70)}]}>
                <View style={[styles.lefttextcontainer, { backgroundColor: '#3C3C3C'}]}>
                        <Text
                        variant='bodySmall'
                        style={{ fontSize: hp(2),textAlign:'auto'}}>{message_text}</Text>
                    </View>
                    <Text
                    variant='bodySmall'
                    style={styles.lefttime}>{date}</Text>
            </View>
           
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
        marginRight: 1,
        paddingRight:5,
        marginTop:5
    },
    textContainer: {
        padding:10,
        borderRadius: 30,
        felx:1,
        alignSelf:'flex-end',
    },
    leftcontainer: {
        marginLeft: 1,
        marginBottom: 10
    },
    lefttextcontainer: {
        padding:5,
        flex:1,
        alignSelf:'flex-start',
        borderRadius:10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 7,
        },
        shadowOpacity: 1,
        shadowRadius: 4.65,
    },
    time:{
        fontSize:8,
        fontFamily:'Helvetica-light',
        alignSelf:'flex-end',
        marginTop:5,
        paddingLeft:5,
        color:'#fff'

    },
    lefttime:{
        fontSize:8,
        fontFamily:'Helvetica-light',
        marginTop:5,
        paddingLeft:5
    }
});

export default MessageItem;


