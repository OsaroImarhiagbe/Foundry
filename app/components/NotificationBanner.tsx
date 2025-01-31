import React,{useState} from 'react'
import { Banner } from 'react-native-paper';

const NotificationBanner = ({title,message,visible}) => {
    const [isvisible,setVisible] = useState()
  return (
    <Banner
    visible={visible}
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
       {title}
       {message} 
    </Banner>
  )
}

export default NotificationBanner