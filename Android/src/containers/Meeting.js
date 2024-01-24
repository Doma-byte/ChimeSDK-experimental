import React from "react";
import { View, Text, FlatList, Alert, TouchableOpacity } from "react-native";
import styles from "../Style";
import {
  NativeFunction,
  getSDKEventEmitter,
  MobileSDKEvent,
  MeetingError,
} from "../utils/Bridge";
import { RNVideoRenderView } from "../components/RNVideoRenderView";
import { MuteButton } from "../components/MuteButton";
import { HangOffButton } from "../components/HangOffButton";
import { AttendeeItem } from "../components/AttendeeItem";
import { CameraButton } from "../components/CameraButton";
import Sound from "react-native-sound";
import ringtone from "../assets/ringtone.mp3";
import {SwitchCameraButton} from "../components/SwitchCameraButton";
import { SwitchMicrophoneToSpeakerButton } from "../components/SwitchMicrophoneToSpeakerButton";

// Maps attendee Id to attendee Name
const attendeeNameMap = {};
Sound.setCategory("Playback", true);

export class Meeting extends React.Component {
  constructor() {
    super();
    this.state = {
      attendees: [],
      videoTiles: [],
      mutedAttendee: [],
      selfVideoEnabled: false,
      meetingTitle: "",
      screenShareTile: null,
      isRinging: false,
    };
    this.ringSound = new Sound(ringtone, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error("Failed to load the sound", error);
      } else {
        this.ringSound.setVolume(1.0);
      }
    });
  }


  componentDidMount() {
    /**
     * Attendee Join and Leave handler
     */
    this.onAttendeesJoinSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesJoin,
      ({ attendeeId, externalUserId }) => {
        if (!(attendeeId in attendeeNameMap)) {
          // The externalUserId will be a format such as c19587e7#Alice
          attendeeNameMap[attendeeId] = externalUserId.split("#")[1];
        }
        this.setState((oldState) => ({
          ...oldState,
          attendees: oldState.attendees.concat([attendeeId]),
        }));
      }
    );

    this.onAttendeesLeaveSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesLeave,
      ({ attendeeId }) => {
        this.setState((oldState) => ({
          ...oldState,
          attendees: oldState.attendees.filter(
            (attendeeToCompare) => attendeeId != attendeeToCompare
          ),
        }));
      }
    );

    /**
     * Attendee Mute & Unmute handler
     */
    this.onAttendeesMuteSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesMute,
      (attendeeId) => {
        this.setState((oldState) => ({
          ...oldState,
          mutedAttendee: oldState.mutedAttendee.concat([attendeeId]),
        }));
      }
    );

    this.onAttendeesUnmuteSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesUnmute,
      (attendeeId) => {
        this.setState((oldState) => ({
          ...oldState,
          mutedAttendee: oldState.mutedAttendee.filter(
            (attendeeToCompare) => attendeeId != attendeeToCompare
          ),
        }));
      }
    );

    /**
     * Video tile Add & Remove Handler
     */
    this.onAddVideoTileSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAddVideoTile,
      (tileState) => {
        if (tileState.isScreenShare) {
          this.setState((oldState) => ({
            ...oldState,
            screenShareTile: tileState.tileId,
          }));
        } else {
          this.setState((oldState) => ({
            ...oldState,
            videoTiles: [...oldState.videoTiles, tileState.tileId],
            selfVideoEnabled: tileState.isLocal
              ? true
              : oldState.selfVideoEnabled,
            isRinging: true,
          }));
          if (this.ringSound) {
            this.ringSound.setNumberOfLoops(-1);
            this.ringSound.play();
            this.fetchAudioDevicesList();
          }
        }
      }
    );

    this.onRemoveVideoTileSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnRemoveVideoTile,
      (tileState) => {
        if (tileState.isScreenShare) {
          this.setState((oldState) => ({
            ...oldState,
            screenShareTile: null,
          }));
        } else {
          this.setState((oldState) => ({
            ...oldState,
            videoTiles: oldState.videoTiles.filter(
              (tileIdToCompare) => tileIdToCompare != tileState.tileId
            ),
            selfVideoEnabled: tileState.isLocal
              ? false
              : oldState.selfVideoEnabled,
            isRinging: false,
          }));
          if (this.ringSound) {
            this.ringSound.stop();
          }
        }
      }
    );

    /**
     * Data message handler
     */
    this.onDataMessageReceivedSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnDataMessageReceive,
      (dataMessage) => {
        const str = `Received Data message (topic: ${dataMessage.topic}) ${dataMessage.data} from ${dataMessage.senderAttendeeId}:${dataMessage.senderExternalUserId} at ${dataMessage.timestampMs} throttled: ${dataMessage.throttled}`;
        console.log(str);
        NativeFunction.sendDataMessage(dataMessage.topic, str, 1000);
      }
    );

    /**
     * General Error handler
     */
    this.onErrorSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnError,
      (errorType) => {
        switch (errorType) {
          case MeetingError.OnMaximumConcurrentVideoReached:
            Alert.alert(
              "Failed to enable video",
              "maximum number of concurrent videos reached!"
            );
            break;
          default:
            Alert.alert("Error", errorType);
            break;
        }
      }
    );
  }

  componentWillUnmount() {
    if (this.onAttendeesJoinSubscription) {
      this.onAttendeesJoinSubscription.remove();
    }
    if (this.onAttendeesLeaveSubscription) {
      this.onAttendeesLeaveSubscription.remove();
    }
    if (this.onAttendeesMuteSubscription) {
      this.onAttendeesMuteSubscription.remove();
    }
    if (this.onAttendeesUnmuteSubscription) {
      this.onAttendeesUnmuteSubscription.remove();
    }
    if (this.onAddVideoTileSubscription) {
      this.onAddVideoTileSubscription.remove();
    }
    if (this.onRemoveVideoTileSubscription) {
      this.onRemoveVideoTileSubscription.remove();
    }
    if (this.onDataMessageReceivedSubscription) {
      this.onDataMessageReceivedSubscription.remove();
    }
    if (this.onErrorSubscription) {
      this.onErrorSubscription.remove();
    }
    if (this.ringSound) {
      this.ringSound.release();
    }
  }

  fetchAudioDevicesList = async () => {
    const deviceList = await NativeFunction.getAudioDevicesList();
    console.log("Device List : ",deviceList);
  };

  switchMicrophoneToSpeaker = () =>{
    NativeFunction.switchMicrophoneToSpeaker()
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.error(error);
    })
  }
  switchCamera = () => {
    NativeFunction.switchCamera()
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
  };

  render() {
    const currentMuted = this.state.mutedAttendee.includes(
      this.props.selfAttendeeId
    );
    
    return (
      <View style={[styles.container, { justifyContent: "flex-start" }]}>
        <Text style={styles.title}>{this.props.meetingTitle}</Text>
        <View style={styles.buttonContainer}>
          <MuteButton
            muted={currentMuted}
            onPress={() => NativeFunction.setMute(!currentMuted)}
          />
          <SwitchMicrophoneToSpeakerButton onPress={this.switchMicrophoneToSpeaker} />
          <CameraButton
            disabled={this.state.selfVideoEnabled}
            onPress={() =>
              NativeFunction.setCameraOn(!this.state.selfVideoEnabled)
            }
          />
          <SwitchCameraButton onPress={this.switchCamera} />
          <HangOffButton onPress={() => NativeFunction.stopMeeting()} />
        </View>
        <Text style={styles.title}>Video</Text>
        <View style={styles.videoContainer}>
          {this.state.videoTiles.length > 0 ? (
            this.state.videoTiles.map((tileId) => (
              <View key={tileId} style={styles.videoTileContainer}>
                <RNVideoRenderView
                  style={styles.video}
                  key={tileId}
                  tileId={tileId}
                  facingMode={this.state.cameraFacingMode}
                />
                {this.state.isRinging && (
                  <Text style={styles.ringingText}>Ringing...</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.subtitle}>
              No one is sharing video at this moment
            </Text>
          )}
        </View>
        {!!this.state.screenShareTile && (
          <React.Fragment>
            <Text style={styles.title}>Screen Share</Text>
            <View style={styles.videoContainer}>
              <RNVideoRenderView
                style={styles.screenShare}
                key={this.state.screenShareTile}
                tileId={this.state.screenShareTile}
              />
            </View>
          </React.Fragment>
        )}
        <Text style={styles.title}>Attendee</Text>
        <FlatList
          style={styles.attendeeList}
          data={this.state.attendees}
          renderItem={({ item }) => (
            <AttendeeItem
              attendeeName={
                attendeeNameMap[item] ? attendeeNameMap[item] : item
              }
              muted={this.state.mutedAttendee.includes(item)}
            />
          )}
          keyExtractor={(item) => item}
        />
      </View>
    );
  }
}
