import React,{useState} from 'react'
import {View, Text,StyleSheet,Platform,Keyboard,TouchableWithoutFeedback} from 'react-native'
import color from '../../config/color'
import Autocomplete from 'react-native-autocomplete-input'
import {db} from '../../FireBase/FireBaseConfig';
import {getDoc,doc, collection, onSnapshot,query,where } from 'firebase/firestore';

const SkillsScreen = () => {
    const [ query, setQuery ] = useState('');

   
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.screen}>
    <View style={styles.headingContainer}>
        <Text style={styles.headingText}>Skills</Text>
    </View>
    <View style={styles.inputContainer}>
    <Autocomplete
      data={[]}
      placeholder='Enter skills...'
      placeholderTextColor='#000'
      containerStyle={{padding:20}}
      value={query}
      onChangeText={(text) => setQuery(text)}
      flatListProps={{
        keyExtractor: (_, idx) => idx,
        renderItem: ({ item }) => <Text>{item}</Text>,
      }}
    />

    </View>
   </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
        backgroundColor:color.backgroundcolor,
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    headingContainer:{
        padding:40,
    },
    headingText:{
        color:color.textcolor,
        fontFamily:color.textFont,
        fontSize:30
    },
})

export default SkillsScreen