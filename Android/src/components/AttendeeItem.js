import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from '../Style';

let mutedImg = require('../assets/microphone-muted.png');

export const AttendeeItem = ({ attendeeName, muted }) => {
  return (
    <View style={styles.attendeeContainer}>
      <Text >{attendeeName}</Text>
      {
        muted && <Image source={mutedImg} style={styles.attendeeMuteImage}/>
      }
    </View>
  );
}
