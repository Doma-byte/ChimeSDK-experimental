import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Alert,
  Text
} from 'react-native';
import { Meeting } from './containers/Meeting';
import { createMeetingRequest } from './utils/Api';
import { getSDKEventEmitter, MobileSDKEvent, NativeFunction } from './utils/Bridge';

class Chime extends React.Component {
  constructor() {
    super();
    this.state = {
      isInMeeting: false,
      isLoading: false,
      meetingTitle: '',
      selfAttendeeId: '',
      audioOnly: false,
    }
  }
  componentDidMount() {
    console.log("Meeting name is : ",this.props.route.params.meetingName);
    const { meetingName, userName, audioOnly } = this.props.route.params;

    this.onMeetingStartSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnMeetingStart, () => {
      this.setState({ isInMeeting: true, isLoading: false });
    });

    this.onMeetingEndSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnMeetingEnd, () => {
      this.setState({ isInMeeting: false, isLoading: false });
    });

    this.onErrorSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnError, (message) => {
      Alert.alert("SDK Error", message);
    });

    this.initializeMeetingSession(meetingName, userName, audioOnly);
  }

  componentWillUnmount() {
    if (this.onMeetingEndSubscription) {
      this.onMeetingEndSubscription.remove();
    }
    if (this.onMeetingStartSubscription) {
      this.onMeetingStartSubscription.remove();
    }
    if (this.onErrorSubscription) {
      this.onErrorSubscription.remove();
    }
  }

  initializeMeetingSession = (meetingName, userName, audioOnly) => {
    this.setState({
      isLoading: true,
    })

    createMeetingRequest(meetingName, userName).then(meetingResponse => {
      this.setState({
        meetingTitle: meetingName,
        selfAttendeeId: meetingResponse.JoinInfo.Attendee.Attendee.AttendeeId,
        audioOnly: audioOnly,
      })
      NativeFunction.startMeeting(meetingResponse.JoinInfo.Meeting.Meeting, meetingResponse.JoinInfo.Attendee.Attendee);
    }).catch(error => {
      Alert.alert("Unable to find meeting", `There was an issue finding that meeting. The meeting may have already ended, or your authorization may have expired.\n ${error}`);
      this.setState({ isLoading: false });
    });
  }

  renderRoute() {
      return <Meeting 
      meetingTitle={this.state.meetingTitle} 
      selfAttendeeId={this.state.selfAttendeeId} 
      props={this.props} 
      audioOnly={this.state.audioOnly} 
      senderId={this.props.route.params.senderId}
      receiverId={this.props.route.params.receiverId}
      />;
  }

  render() {
    return (
      <React.Fragment>
        <StatusBar />
        <SafeAreaView>
          { this.renderRoute() }
        </SafeAreaView>
      </React.Fragment>
    );
  }
}
export default Chime;
