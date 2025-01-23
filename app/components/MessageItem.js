import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import color from '../../config/color';

const MessageItem = ({ message_text, current_User,date,id}) => {
    
    if (current_User?.userId !== id) {
        return (
            
            <View style={styles.container}>
                <View style={{width:wp(70)}}>
                    <View style={[styles.textContainer,{backgroundColor:color.grey}]}>
                    <Text style={{ fontSize: hp(1.5),fontFamily:'Helvetica-light',color:'#fff' }}>{message_text}</Text>
                    </View>
                    <Text style={styles.time}>{date}</Text>
                </View>
            </View>
        );
    } else {
        return (
            <View style={[styles.leftcontainer, , {width:wp(70)}]}>
                <View style={[styles.lefttextcontainer, { backgroundColor: color.lightblue }]}>
                        <Text style={{ fontSize: hp(1.5),fontFamily:'Helvetica-light' }}>{message_text}</Text>
                    </View>
                    <Text style={styles.lefttime}>{date}</Text>
            </View>
           
        );
    }
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
        marginRight: 1
    },
    textContainer: {
        padding:5,
        borderRadius: 10,
        felx:1,
        alignSelf:'flex-end',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 7,
        },
        shadowOpacity: 1,
        shadowRadius: 4.65,
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
        marginTop:10,
        paddingLeft:5
    },
    lefttime:{
        fontSize:8,
        fontFamily:'Helvetica-light',
        marginTop:10,
        paddingLeft:5
    }
});

export default MessageItem;


