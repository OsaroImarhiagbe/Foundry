import React,{useState} from 'react'
import {View,Text,StyleSheet,Modal,Pressable,TextInput, TouchableWithoutFeedback,Keyboard} from 'react-native'
import color from '../../config/color'

const ReportBugScreen = () => {
    const [modalVisible, setModalVisible] = useState(false);
  return (
    
        <View style={styles.screen}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
            <View style={{marginBottom:20}}>
            <Text style={styles.modalText}>Help Make DevGuides Better!</Text>
            </View>
              <View style={{borderWidth:2,padding:20,width:'100%',borderRadius:25}}>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <TextInput
              placeholder='Report....'
              placeholderTextColor='#000'
              />
               </TouchableWithoutFeedback>
              </View>
              <Pressable
                style={[styles.button, {backgroundColor:'#00bf63'}]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Submit Report</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <View style={styles.container}>
        <View style={styles.reportcontaienr}>
        <Text style={styles.textStyle}>Report A Bug</Text>
        <Pressable
          style={[styles.button, {backgroundColor:'#00bf63'}]}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.textStyle}>Report</Text>
        </Pressable>
        </View>
        </View>
    </View>
   
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
        backgroundColor:color.backgroundcolor,
        justifyContent:'center',
        alignItems:'center'
    },
    container:{
        padding:20,
    },
    reportcontaienr:{
        backgroundColor:'#3b3b3b',
        width:'100%', 
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        padding:20,borderRadius:20
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
         backgroundColor: 'rgba(0, 0, 0, 0.5)'
      },
    modalView: {
        margin: 20,
        width:'80%',
        height:'60%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        justifyContent:'center',
      },
      button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop:10
      },
      textStyle: {
        color: '#fff',
        textAlign: 'center',
        fontFamily:color.textFont,
        fontSize:15
      },
      modalText: {
        textAlign: 'center',
        fontFamily:color.textFont,
        fontSize:30
      },
})
export default ReportBugScreen