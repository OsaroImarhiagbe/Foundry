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
  searchQuery?:string | any,
  title?:string,
}

const SearchComponent:React.FC<SearchProp> = ({color,onPress, setSearchQuery,searchQuery,title}) => {
  const theme = useTheme()
  return (
   <Searchbar
    onIconPress={onPress}
    placeholder={title}
    style={{
      width:wp('60%'),
      height:50,
      backgroundColor:theme.colors.onTertiary
    }}
    inputStyle={{
      color:theme.colors.tertiary
      }}
    onChangeText={setSearchQuery}
    value={searchQuery}
    />
  )
}
export default SearchComponent
