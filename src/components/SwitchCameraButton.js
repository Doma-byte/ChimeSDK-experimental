import React from 'react'
import {TouchableOpacity, Image} from 'react-native'
import styles from '../Style';

export const SwitchCameraButton = ({ onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Image
      style={styles.meetingButton}
      source={require('../assets/switchCamera.png')}
    />
    </TouchableOpacity>
  );
