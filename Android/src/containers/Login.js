import React from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import UUIDGenerator from "react-native-uuid-generator";
import styles from '../Style';

export class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      meetingName: "",
      userName: "",
    };
  }

  generateUniqueMeetingName = async () => {
    try {
      const uuid = await UUIDGenerator.getRandomUUID();
      this.setState({ meetingName: uuid });
      console.log("MEETING : ", this.state.meetingName);
    } catch (error) {
      console.error("Error generating random values:", error);
    }
  };

  handleGenerateUUID = () => {
    this.generateUniqueMeetingName();
  }

  startMeeting = () => {
    if (!this.state.userName) {
      Alert.alert("User name cannot be empty");
    } else {
      this.props.onSubmit(this.state.meetingName, this.state.userName);
    }
  }

  renderForm() {
    return (
      <React.Fragment>
        <TextInput
          style={styles.inputBox}
          value={this.state.meetingName}
          editable={false}
          placeholder="Auto-generated UUID"
        />
        <Button title='Generate UUID' onPress={this.handleGenerateUUID}></Button>
       <TextInput
          style={styles.inputBox}
          placeholder="Your Name"
          onChangeText={(val) => this.setState({ userName: val.trim() })}
        />
        <Button title="Start" onPress={this.startMeeting} />
      </React.Fragment>
    );
  }

  renderLoading() {
    return <Text>Loading, please wait...</Text>
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mobile SDK Demo</Text>
        { !!this.props.isLoading ? this.renderLoading() : this.renderForm() }
      </View>
    );
  }
}
