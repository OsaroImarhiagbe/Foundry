import React, {useState} from 'react'
import {
    View,
    StyleSheet,
    SafeAreaView,
    useWindowDimensions} from 'react-native';
import { Formik} from 'formik';
import AppTextInput from '../components/AppTextInput';
import color from '../../config/color';
//import Button from '../components/Button';
import * as Yup from 'yup';
import { useAuth} from '../authContext';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useNavigation } from '@react-navigation/native';
import { TextInput,Text,HelperText,ActivityIndicator} from 'react-native-paper';
import LottieView from 'lottie-react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Button } from 'react-native-paper';




const RegisterScreen = () => {

    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const {width,height} = useWindowDimensions()
    const { register } = useAuth();
    const handleRegister = async (values, {resetForm} )=> {
        setLoading(true);
        try{
            let response = await register(values.username, values.email, values.password)
            if(response){
                navigation.navigate('Onboarding')
                setLoading(false)
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
            <SafeAreaView style={styles.screen}>
                <View
                style={styles.backImage}
                >
                  <Text>
                  <LottieView
               style={{
                width:width*0.9,
                height:hp('40%'),
                alignItems:'center',
                justifyContent:'center'}}
                renderMode={'SOFTWARE'}
                source={require('../assets/animations/animation1.json')} autoPlay loop />;
                  </Text>
                </View>
                <View style={styles.whitesheet}>
                <View style={styles.headingcontainer}>
                    <Text
                    variant='titleLarge'
                    style={{textAlign:'center',color:'#fff',fontFamily:color.textFont}}>Register</Text>
                    <Text
                    variant='titleMedium'
                    style={{textAlign:'center',color:'#fff',fontFamily:color.textFont}}
                     >Create a new account</Text>
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
                                     backgroundColor='transparent'
                                    borderColor='#8a8a8a'
                                    value={values.username}
                                    onChangeText={handleChange('username')}
                                    onBlur={() => setFieldTouched('username')}
                                    iconcolor={color.button}
                                />
                                {touched.username && errors.username &&( <HelperText
                                    type='error'
                                    visible={errors}
                                    style={styles.errormessage}>{errors.username}</HelperText>)}
                                <AppTextInput
                                    icon='email'
                                    keyboardType='email-address'
                                    placeholder='Email'
                                    backgroundColor='transparent'
                                    borderColor='#8a8a8a'
                                    value={values.email}
                                    onChangeText={handleChange('email')}
                                    onBlur={() => setFieldTouched('email')}
                                    iconcolor={color.button}
                                />
                                {touched.email && errors.email && (<HelperText type='error' visible={errors} style={styles.errormessage}>{errors.email}</HelperText>)}
                                <AppTextInput
                                    icon='lock'
                                    secureTextEntry
                                    placeholder='Password'
                                    backgroundColor='transparent'
                                    borderColor='#8a8a8a'
                                    value={values.password}
                                    onChangeText={handleChange('password')}
                                    onBlur={() => setFieldTouched('password')}
                                    iconcolor={color.button}
                                    right={<TextInput.Icon  icon="eye" />}
                                />
                                {touched.password && errors.password  && (<HelperText  type='error' visible={errors} style={styles.errormessage}>{errors.password}</HelperText>)}
                                <AppTextInput
                                    icon='lock'
                                    secureTextEntry
                                    placeholder='Confirm Password'
                                    backgroundColor='transparent'
                                    borderColor='#8a8a8a'
                                    value={values.confirmPassword}
                                    onChangeText={handleChange('confirmPassword')}
                                    onBlur={() => setFieldTouched('confirmPassword')}
                                    iconcolor={color.button}
                                    right={<TextInput.Icon  icon="eye" />}
                                />
                                {touched.confirmPassword && errors.confirmPassword &&( <HelperText   type='error' visible={errors} style={styles.errormessage}>{errors.confirmPassword}</HelperText>)}
                            </View>
                            <View style={styles.buttoncontainer}>
                                <Button
                                disabled={!isValid}
                                loading={loading}
                                onPress={handleSubmit}
                                mode="contained">Sign Up</Button>
                            </View>
                            <View style={styles.textContainer}>
                                    <Text
                                    variant='bodySmall'
                                    style={{color:'#fff',textAlign:'center'}}>Have an account?</Text>
                                <TouchableWithoutFeedback onPress={() => navigation.navigate('Login')}>
                                    <Text
                                    variant='bodySmall'
                                    style={{color:'#fff',marginLeft:10,textAlign:'center'}}
                                    >Login</Text>
                                </TouchableWithoutFeedback>
                            </View>
                        </>
                    )}
                </Formik>
                </CustomKeyboardView>
                </View>
            </SafeAreaView>
            
    )
}



const styles = StyleSheet.create({
    backImage:{
        width:wp('100%'),
        position:'absolute',
        resizedMode: 'cover',
        backgroundColor:'#8a8a8a'
      }, 
    whitesheet:{
        width:wp('100%'),
        height:hp('65%'),
        position:'absolute',
        bottom:0,
        backgroundColor:'#1f1f1f',
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        padding:20
  } ,
    buttoncontainer:{
        padding:30
    },
    errormessage:{
        color: color.danger,
        textAlign:'center',
        fontFamily:color.textFont
    },
    screen:{
        flex:1

    },
    headingcontainer:{
       padding:30
    },
    textContainer:{
        flexDirection:'row',
        alignSelf:'center'
    },
})
export default RegisterScreen
