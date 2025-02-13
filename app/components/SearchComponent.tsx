import React from 'react'
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native'
import color from '../../config/color';
import { Searchbar,useTheme } from 'react-native-paper';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

interface SearchProp{
  backgroundColor?:string,
  color?:string,
  onPress?:() => void,
  setSearchQuery?:(query:string) => void,
  searchQuery?:string | any
}

const SearchComponent:React.FC<SearchProp> = ({backgroundColor,color,onPress, setSearchQuery,searchQuery}) => {
  const theme = useTheme()
  return (
   <Searchbar
    onIconPress={onPress}
    placeholder="Search"
    style={{
    justifyContent:'space-between',
    width:wp('70%'),
    backgroundColor:theme.colors.onTertiary
    }}
    onChangeText={setSearchQuery}
    value={searchQuery}
    />
  )
}

const styles = StyleSheet.create({

    iconContainer:{
        padding:10
    },
    textinput: {
        color: color.white,
        fontSize: 15,
        padding:10,
        width:'80%' 
    },


})
export default SearchComponent
