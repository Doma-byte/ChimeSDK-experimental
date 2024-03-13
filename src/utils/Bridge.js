import { NativeModules, NativeEventEmitter } from 'react-native';

const _eventEmitter = new NativeEventEmitter(NativeModules.NativeMobileSDKBridge);

export const MobileSDKEvent = {
  OnMeetingStart: 'OnMeetingStart',
  OnMeetingEnd: 'OnMeetingEnd',
  OnAddVideoTile: 'OnAddVideoTile',
  OnRemoveVideoTile: 'OnRemoveVideoTile',
  OnAttendeesJoin: 'OnAttendeesJoin',
  OnAttendeesLeave: 'OnAttendeesLeave',
  OnAttendeesMute: 'OnAttendeesMute',
  OnAttendeesUnmute: 'OnAttendeesUnmute',
  OnAudioDeviceChanged: 'OnAudioDeviceChanged',
  OnDataMessageReceive: 'OnDataMessageReceive',
  OnError: 'OnError',
}

export const MeetingError = {
  OnMaximumConcurrentVideoReached: "OnMaximumConcurrentVideoReached"
}

export function getSDKEventEmitter() {
  return _eventEmitter;
}

export const NativeFunction = {
  startMeeting: NativeModules.NativeMobileSDKBridge.startMeeting,
  stopMeeting: NativeModules.NativeMobileSDKBridge.stopMeeting,
  setMute: NativeModules.NativeMobileSDKBridge.setMute,
  setAudioDevice: NativeModules.NativeMobileSDKBridge.setAudioDevice,
  getAudioDevicesList: NativeModules.NativeMobileSDKBridge.getAudieDevicesList,
  setCameraOn: NativeModules.NativeMobileSDKBridge.setCameraOn,
  bindVideoView: NativeModules.NativeMobileSDKBridge.bindVideoView,
  unbindVideoView: NativeModules.NativeMobileSDKBridge.unbindVideoView,
  switchCamera: NativeModules.NativeMobileSDKBridge.switchCamera,
  sendDataMessage: NativeModules.NativeMobileSDKBridge.sendDataMessage,
  switchMicrophoneToSpeaker: NativeModules.NativeMobileSDKBridge.switchMicrophoneToSpeaker,
}
