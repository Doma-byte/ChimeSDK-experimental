import React from 'react'
import {TouchableOpacity, Image} from 'react-native'
import styles from '../Style';

export const HangOffButton = ({onPress}) => {
  return (  
  <TouchableOpacity 
    onPress={() => {
      onPress();
  }}>
    <Image
      style={styles.meetingButton}
      source={require('../assets/hang-off.png')}
    />
  </TouchableOpacity>
  ) 
}
