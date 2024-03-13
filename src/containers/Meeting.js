import React, { useEffect, useRef } from "react";
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
import { SwitchCameraButton } from "../components/SwitchCameraButton";
import { SwitchMicrophoneToSpeakerButton } from "../components/SwitchMicrophoneToSpeakerButton";
import io from "socket.io-client";

const attendeeNameMap = {};

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
      socketIO: null,
      senderId: null,
      receiverId: null,
    };
    this.cameraButtonRef = React.createRef();
    this.onHangOffPress = this.onHangOffPress.bind(this);
  }

  componentDidMount() {
    if(!this.props.audioOnly){
    setTimeout(() => {
      NativeFunction.setCameraOn(true);
    }, 1000);
  }

  this.state.senderId = this.props.senderId;
    this.state.receiverId = this.props.receiverId;

    const socket = io("https://r336cx6c-3002.inc1.devtunnels.ms/");
    if(this.props.senderId && this.props.receiverId){
      this.state.socketIO = socket;
    }
    
    this.onAttendeesJoinSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnAttendeesJoin,
      ({ attendeeId, externalUserId }) => {
        if (!(attendeeId in attendeeNameMap)) {
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
          }));
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
          }));
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
  }

  HangUp = () => {
    NativeFunction.stopMeeting();
    this.props.props.navigation.goBack();
  }

  onHangOffPress = () => {
    this.state.socketIO.emit("endCall", {SenderId: this.state.senderId, receiverId: this.state.receiverId});
  };


  switchMicrophoneToSpeaker = () => {
    NativeFunction.switchMicrophoneToSpeaker()
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  switchCamera = () => {
    NativeFunction.switchCamera()
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
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
          <SwitchMicrophoneToSpeakerButton
            onPress={this.switchMicrophoneToSpeaker}
          />
          {!this.props.audioOnly && (
            <>
              <CameraButton
            disabled={this.state.selfVideoEnabled}
            onPress={() =>
              NativeFunction.setCameraOn(!this.state.selfVideoEnabled)
            }
          />
          <SwitchCameraButton onPress={this.switchCamera} />
            </>
          )}
          <HangOffButton onPress={this.onHangOffPress} />
        </View>
        <Text style={styles.title}>Video</Text>
        {!this.props.audioOnly && (
        <View style={styles.videoContainer}>
          {this.state.videoTiles.length > 0 ? (
            this.state.videoTiles.map((tileId) => (
              <RNVideoRenderView
                style={styles.video}
                key={tileId}
                tileId={tileId}
              />
            ))
          ) : (
            <Text style={styles.subtitle}>
              No one is sharing video at this moment
            </Text>
          )}
        </View>
        )}
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
