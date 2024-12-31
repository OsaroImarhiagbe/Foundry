import React,{useState,useEffect} from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useDebounce from '../hooks/useDebounce';
import {
  Menu,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MenuItems } from '../components/CustomMenu';
import { blurhash } from '../../utils';
import CustomCheckBox from '../components/CustomCheckBox';
import {View} from 'react-native'
import color from '../../config/color'
import { useDispatch} from 'react-redux';
import { addSkills } from '../features/Skill/skillSlice';

const SearchFilter = () => {
    const [searchSkills,setSearchSkills] = useState([])
    const dispatch = useDispatch()

    useEffect(()=>{
        console.log('skill',searchSkills)

    },[searchSkills])
    const Divider = () => {
        return (
            <View style={{width:'100%',padding:1,borderBottomWidth:2, borderColor:color.grey}}/>
        )
    }

    const handleToggleSkill = (skill,isSelected) => {
        if(isSelected){
          setSearchSkills((prev)=>[...prev,skill])
          dispatch(addSkills(skill))
        }else{
          setSearchSkills((prev) => prev.filter((s) =>  s !== skill))
        }
      }
  return (
    <>
    <Menu>
          <MenuTrigger>
          <View>
          <MaterialCommunityIcons name='filter-variant' size={30} color='#fff'/>
          </View>
      </MenuTrigger>
          <MenuOptions
            customStyles={{
                optionsContainer:{
                    borderRadius:10,
                    marginTop:40,
                    marginLeft:-30,
                    borderCurve:'continuous',
                    backgroundColor:color.white,
                    position:'relative'
                }
            }}
          >
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:5}}>
            <CustomCheckBox label='python' onSkillToggle={handleToggleSkill} />
            <MenuItems 
            text='Python'
            value={null}/>
            </View>
            <Divider/>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:5}}>
            <CustomCheckBox label='Javascript' onSkillToggle={handleToggleSkill}/>
            <MenuItems 
            text='Javascript'
            value={null}/>
            </View>
              <Divider/>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:5}}>
            <CustomCheckBox label='React' onSkillToggle={handleToggleSkill}/>
            <MenuItems 
            text='React'
            value={null}/>
            </View>
            <Divider/>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:5}}>
            <CustomCheckBox label='React Native' onSkillToggle={handleToggleSkill}/>
            <MenuItems 
            text='React Native'
            value={null}/>
            </View>
          </MenuOptions>
        </Menu>
    </>
  )
}

export default SearchFilter