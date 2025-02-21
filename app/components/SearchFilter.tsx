import React,{useState,useEffect} from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Menu,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MenuItems } from './CustomMenu';
import CustomCheckBox from './CustomCheckBox';
import {View} from 'react-native'
import color from '../../config/color'
import { useDispatch} from 'react-redux';
import { addSkills } from '../features/Skill/skillSlice';
import { useTheme } from 'react-native-paper';



const SearchFilter = () => {
    const [searchSkills,setSearchSkills] = useState<string[]>([])
    const dispatch = useDispatch()
    const theme = useTheme()

    useEffect(()=>{
    },[searchSkills])
    const Divider = () => {
        return (
            <View style={{width:'100%',padding:1,borderBottomWidth:2, borderColor:color.grey}}/>
        )
    }

    const handleToggleSkill = (skill:string,isSelected:boolean) => {
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
          <MaterialCommunityIcons name='filter-variant' size={25} color={theme.colors.tertiary}/>
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
            />
            </View>
            <Divider/>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:5}}>
            <CustomCheckBox label='Javascript' onSkillToggle={handleToggleSkill}/>
            <MenuItems 
            text='Javascript'
            />
            </View>
              <Divider/>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:5}}>
            <CustomCheckBox label='React' onSkillToggle={handleToggleSkill}/>
            <MenuItems 
            text='React'
            />
            </View>
            <Divider/>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:5}}>
            <CustomCheckBox label='React Native' onSkillToggle={handleToggleSkill}/>
            <MenuItems 
            text='React Native'
            />
            </View>
          </MenuOptions>
        </Menu>
    </>
  )
}

export default SearchFilter