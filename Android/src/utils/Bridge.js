import { NativeModules, NativeEventEmitter } from 'react-native';

const _eventEmitter = new NativeEventEmitter(NativeModules.NativeMobileSDKBridge);

export const MobileSDKEvent = {
  OnMeetingStart: 'OnMeetingStart',
  OnMeetingEnd: 'OnMeetingEnd',
  OnAttendeesJoin: 'OnAttendeesJoin',
  OnAttendeesLeave: 'OnAttendeesLeave',
  OnAttendeesMute: 'OnAttendeesMute',
  OnAttendeesUnmute: 'OnAttendeesUnmute',
  OnAddVideoTile: 'OnAddVideoTile',
  OnRemoveVideoTile: 'OnRemoveVideoTile',
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
  setCameraOn: NativeModules.NativeMobileSDKBridge.setCameraOn,
  bindVideoView: NativeModules.NativeMobileSDKBridge.bindVideoView,
  unbindVideoView: NativeModules.NativeMobileSDKBridge.unbindVideoView,
  sendDataMessage: NativeModules.NativeMobileSDKBridge.sendDataMessage,
}
