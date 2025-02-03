import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import color from '../../config/color';

interface CustomeCheckBoxProp{
  label?:string,
  onSkillToggle:any,
}

const CustomCheckBox:React.FC<CustomeCheckBoxProp> = ({label,onSkillToggle}) => {
    const [isChecked, setIsChecked] = useState(false);
    const handleChecked = () => {
        setIsChecked(!isChecked);
        onSkillToggle(label, !isChecked);
    };
    

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={handleChecked}
      >
        <View style={styles.checkbox}>
          {isChecked && <MaterialIcons name="check" size={20} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 0.5,
      borderColor: '#ccc',
      backgroundColor: color.checkbox,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    }
  });
export default CustomCheckBox