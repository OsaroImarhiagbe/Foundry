
import {View,Text,StyleSheet,Keyboard, TouchableWithoutFeedback,SafeAreaView} from 'react-native'
import color from '../../config/color';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import 'react-native-get-random-values';
import firestore from 'react-native-firebase/firestore'
import { useAuth } from '../authContext';
import {GoogleAPIKey} from "@env"
const LocationScreen = () => {
    const {user} = useAuth()

   return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <SafeAreaView style={styles.screen} >
    <View style={styles.conatiner}>
    <Text style={styles.label}>Select Your City</Text>
    <GooglePlacesAutocomplete
      placeholder='Enter your Location...'
      onPress={async (data, details = null) => {
        const city = data.structured_formatting.main_text
        const state = data.structured_formatting.secondary_text
        const formattedCity = `${city}, ${state.split(',')[0]}`;
        const docRef = doc(db,'users',user.userId)
        await firestore().collection('users').doc(user?.userId).update({
          location:formattedCity
        })
      }}
      query={{
        key:GoogleAPIKey,
        language: 'en',
        type:'(cities)'
      }}
      fetchDetails={true}
      styles={{
        textInput: styles.textInput,
        container: { flex: 0 },
      }}
    />
    </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1,
        backgroundColor:color.backgroundcolor
    },
    conatiner:{
        padding:16
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        color:"#fff"
    },
    textInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 8,
        marginBottom: 16,
    },
})

export default LocationScreen