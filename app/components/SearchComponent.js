import React from 'react'
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'
import color from '../../config/color';

const SearchComponent = ({backgroundColor,color,onPress, setSearchQuery,searchQuery}) => {
  return (
   <View style={[styles.searchContainer,{backgroundColor:backgroundColor}]}>
    <TextInput
    style={styles.textinput}
    placeholder='Search.....'
    placeholderTextColor='#000'
    onChangeText={setSearchQuery}
    value={searchQuery}
    />
    <View style={styles.iconContainer}>
        <TouchableOpacity onPress={onPress}>
        <AntDesign 
        name='search1'
        size={25}
        color={color}/>
        </TouchableOpacity>
    </View>
    </View>
  )
}

const styles = StyleSheet.create({

    iconContainer:{
        padding:10
    },
    searchContainer:{
        flexDirection:'row',
        padding: 5,
        borderRadius:30,
        justifyContent:'space-between',
          shadowColor: '#000',
        shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 1,
    shadowRadius: 4.65,
    width:'85%'

    },
    textinput: {
        color: color.white,
        fontSize: 15,
        padding:10
    },


})
export default SearchComponent
