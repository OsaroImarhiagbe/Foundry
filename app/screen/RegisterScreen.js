import React, {useState} from 'react'
import {View, Text,StyleSheet,Platform,StatusBar, TouchableOpacity,Alert, ActivityIndicator, Image} from 'react-native';
import { Formik} from 'formik';
import AppTextInput from '../components/AppTextInput';
import color from '../../config/color';
import Button from '../components/Button';
import * as Yup from 'yup';
import { useAuth} from '../authContext';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useNavigation } from '@react-navigation/native';





const RegisterScreen = () => {

    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const { register } = useAuth();
    const handleRegister = async (values, {resetForm} )=> {
        setLoading((prev) => !prev);
        try{
            let response = await register(values.username, values.email, values.password)
            if(response){
                setLoading((prev)=> !prev)
                navigation.navigate('Onboarding')
                Alert.alert('Success','You have registered!')
            }
            resetForm({values:initialValues})
        }catch(error){
            setLoading(false)
            console.error('error with register',error)
        }
    }    

    const validationSchema = Yup.object().shape({
        username: Yup.string()
        .min(8)
        .max(10)
        .required('Username is required'),
        email: Yup.string()
        .email('Invalid email')
        .required('Please enter your email'),
        password: Yup.string()
        .min(8, 'Password must contain at least 8 characters')
        .max(50)
        .required('Please enter your password')
        .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
        confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please enter password again'),
      });

    const initialValues = {
        username:'',
        email:'', 
        password:'', 
        confirmPassword:''}

    return (

            <View style={styles.container}>
                <View
                style={styles.backImage}
                >
                    <Image
                    style={styles.logo}
                    source={require('../assets/DevGuide.png')}/>
                </View>
                <View style={styles.whitesheet}>
                <View style={styles.headingcontainer}>
                    <Text style={styles.heading}>Register</Text>
                    <Text style={styles.bottomText} >Create a new account</Text>
                </View>
                <CustomKeyboardView>
                <Formik
                   initialValues={initialValues}
                    onSubmit={handleRegister}
                    validationSchema={validationSchema}
                >
                    {({handleChange, handleSubmit, values, setFieldTouched,touched, errors, isValid}) => (
                        <>
                            <View>
                            <AppTextInput
                                    icon='account'
                                    placeholder='Username'
                                    backgroundColor='#252525'
                                    borderColor='#8a8a8a'
                                    value={values.username}
                                    onChangeText={handleChange('username')}
                                    onBlur={() => setFieldTouched('username')}
                                    iconcolor={color.button}
                                />
                                {touched.username && errors.username &&( <Text style={styles.errormessage}>{errors.username}</Text>)}
                                <AppTextInput
                                    icon='email'
                                    keyboardType='email-address'
                                    placeholder='Email'
                                    backgroundColor='#252525'
                                    borderColor='#8a8a8a'
                                    value={values.email}
                                    onChangeText={handleChange('email')}
                                    onBlur={() => setFieldTouched('email')}
                                    iconcolor={color.button}
                                />
                                {touched.email && errors.email && (<Text style={styles.errormessage}>{errors.email}</Text>)}
                                <AppTextInput
                                    icon='lock'
                                    secureTextEntry
                                    placeholder='Password'
                                    backgroundColor='#252525'
                                    borderColor='#8a8a8a'
                                    value={values.password}
                                    onChangeText={handleChange('password')}
                                    onBlur={() => setFieldTouched('password')}
                                    iconcolor={color.button}
                                />
                                {touched.password && errors.password  && (<Text style={styles.errormessage}>{errors.password}</Text>)}
                                <AppTextInput
                                    icon='lock'
                                    secureTextEntry
                                    placeholder='Confirm Password'
                                    backgroundColor='#252525'
                                    borderColor='#8a8a8a'
                                    value={values.confirmPassword}
                                    onChangeText={handleChange('confirmPassword')}
                                    onBlur={() => setFieldTouched('confirmPassword')}
                                    iconcolor={color.button}
                                />
                                {touched.confirmPassword && errors.confirmPassword &&( <Text style={styles.errormessage}>{errors.confirmPassword}</Text>)}
                            </View>
                            <View style={styles.buttoncontainer}>
                                {
                                    loading ? (
                                        <ActivityIndicator size='large' color={color.white} />) 
                                    :(  <Button title='Register' 
                                        fontSize={15}
                                    disabled={!isValid}
                                    onPress={handleSubmit} 
                                    color={isValid ? color.white : color.grey} />)
                                }
                              
                            </View>
                            <View style={styles.textContainer}>
                                    <Text style={styles.text}>Have an account?</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.text1}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </Formik>
                </CustomKeyboardView>
            
                </View>
               
            </View>
      
      
      
     
 
    
      
    )
}



const styles = StyleSheet.create({
    backImage:{
        width: '100%',
        height: 340,
        position:'absolute',
        top:0,
        resizedMode: 'cover',
        backgroundColor:'#8a8a8a'
      },
      logo:{
        marginLeft:110,
        marginTop:30,
        width:180,
        height:180,
        
      },  
    whitesheet:{
        width:'100%',
        height:'75%',
        position:'absolute',
        bottom:0,
        backgroundColor:'#1f1f1f',
        borderTopLeftRadius: 60,
        padding:20
        
  } , 

    buttoncontainer:{
        padding:10
    },
    container:{
      flex:1,
    },
    errormessage:{
        color: color.danger,
        textAlign:'center',
        fontFamily:color.textFont
    },
    screen:{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        flex:1

    },
    heading:{
        fontSize:25,
        textAlign:'center',
        color:'#ffffff',
        fontFamily:color.textFont

    },
    headingcontainer:{
       padding:10
    },
    bottomText:{
        textAlign:'center',
        marginTop:10,
        fontSize:15,
        fontFamily:color.textFont,
        color:color.grey
    },
    textContainer:{
        flexDirection:'row',
        alignSelf:'center'
    },
    text:{
        color:color.grey,
        textAlign:'center',
        fontSize: 15,
        fontFamily:color.textFont
    },
    text1:{
        color:color.grey,
        fontSize: 15,
        fontFamily:color.textFont,
        marginLeft:10
    },
})
export default RegisterScreen
