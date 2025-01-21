import React,{useState} from 'react'
import { Banner } from 'react-native-paper';

const NotificationBanner = ({title,message,onClose}) => {
    const [visible,setVisible] = useState()
  return (
    <Banner
    actions={[
        {
          label: 'Fix it',
          onPress: () => setVisible(false),
        },
        {
          label: 'Learn more',
          onPress: () => setVisible(false),
        },
      ]}
    >
       {notfication} 
    </Banner>
  )
}

export default NotificationBanner