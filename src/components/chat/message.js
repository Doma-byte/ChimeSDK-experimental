import React, { useEffect, useState, useRef, useContext } from "react";
import {
  AsyncStorage,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Linking,
} from "react-native";
import { NativeModules } from "react-native";
import Sound from "react-native-sound";
import axios from "axios";
import { AuthCtx } from "../../App";
import io from "socket.io-client";
import { NativeFunction } from "../../utils/Bridge";
import YoutubePlayer from "react-native-youtube-iframe";
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
} from "@notifee/react-native";
import RNCallKeep from "react-native-callkeep";
import ConfigLink from "../config/config";

const default_photo = require("../../assets/images/default-profile.png");
const ringtone = require("../../assets/ringtone.mp3");
const { RNRingtone } = NativeModules;

const Message = ({ route, navigation }) => {
  const { userName, setName } = useContext(AuthCtx);
  const { friendId, friendName, friendPhoto } = route.params;
  const [messageList, setMessage] = useState([]);
  const [currMem, setMember] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const socket = useRef(io("https://r336cx6c-3002.inc1.devtunnels.ms/"));
  const detailsRef = useRef(null);
  const soundRef = useRef(null);

  var value1 = JSON.parse(userName);

  useEffect(() => {
    Sound.setCategory("Playback", true);
    soundRef.current = new Sound(ringtone, (error) => {
      if (error) {
        console.log("Failed to load the sound", error);
        return;
      }
    });
    requestUserPermission();
    return () => {
      soundRef.current.release();
    };
  }, []);

  const playSound = () => {
    if (soundRef.current) {
      soundRef.current.setNumberOfLoops(-1);
      soundRef.current.play((success) => {
        if (!success) {
          console.log("Sound did not play");
        }
      });
    }
  };

  const pauseSound = () => {
    if (soundRef.current) {
      soundRef.current.pause();
    }
  };

  const isYoutubeUrl = (url) => {
    return url.match(/(youtube\.com|youtu\.be)\/(watch)?(\?v=)?(\S+)?/);
  };

  const extractYouTubeID = (url) => {
    const match = url.match(
      /(?:youtube\.com.*(?:\\?|&)(?:v)=|youtu\.be\/)([^&?]*)(?:[?&]t=([^&\s]+))?/
    );
    return match ? match[1] : null;
  };

  const navigateToChimeScreen = (details) => {
    navigation.navigate("Chime", {
      meetingName: details.meetingId,
      userName: value1.name,
      audioOnly: details.audioOnly,
      senderId: details.callerId,
      receiverId: details.recipientId,
    });
  };

  const requestUserPermission = async () => {
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      console.log("Permission settings : ", settings);
    } else {
      console.log("User declined permissions ");
    }
  };

  const options = {
    ios: {
      appName: "Actpal",
    },
    android: {
      alertTitle: "Permissions required",
      alertDescription: "This application needs to access your phone accounts",
      cancelButton: "Cancel",
      okButton: "OK",
    },
  };

  RNCallKeep.setup(options).then(() => {
    console.log("CallKeep setup done");
  });

  const onDisplayNotification = async (details) => {
    try {
      RNCallKeep.displayIncomingCall(
        details?.meetingId,
        `${details?.callerId}`,
        details?.name,
        `${details?.recipientId}`,
        false
      );
    } catch (err) {
      console.log("Error is : ", err);
    }
  };

  useEffect(() => {
    setMember(value1);
    if (value1 && value1.id) {
      socket.current.emit("joinRoom", { userId: value1.id, friendId });
      fetchChatHistory(value1.memberToken, friendId);
    }

    const receiveMessageListener = (message) => {
      setMessage((prevMessages) => [
        ...prevMessages,
        {
          ...message,
          isSentByCurrentUser: message.SenderID === currMem?.id,
        },
      ]);
    };

    socket.current.on("receiveMessage", receiveMessageListener);

    return () => {
      if (socket.current) {
        socket.current.off("receiveMessage", receiveMessageListener);
        socket.current.disconnect();
      }
    };
  }, [friendId]);

  useEffect(() => {
    const cutCallHandler = () => {
        NativeFunction.stopMeeting();
        RNCallKeep.endCall(detailsRef.current?.meetingId);
        navigation.goBack();
    };

    socket.current.on("cutCall", cutCallHandler);

    return () => {
        socket.current.off("cutCall", cutCallHandler);
    };
}, [navigation]);

  const fetchChatHistory = async (memberToken, friendId) => {
    try {
      const response = await axios.get(
        `${ConfigLink.chatHistory}${memberToken}&MemId=${friendId}&pageSize=30&page=1`
      );
      setMessage(
        response.data.map((msg) => ({
          ...msg,
          isSentByCurrentUser: msg.SenderID === currMem?.id,
        }))
      );
    } catch (error) {
      console.log("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    const handleCallAcceptance = (details) => {
      navigateToChimeScreen(details);
    };

    
    socket.current.on("playRingtone", (details) => {
      detailsRef.current = details;
      if (details.recipientId === value1.id) {
        onDisplayNotification(details);
        RNCallKeep.addEventListener("answerCall", () => {
          console.log("Accept the call");
          if (detailsRef.current && detailsRef.current.meetingId) {
            socket.current.emit("callAccepted", { ...detailsRef.current });
          }
        });

        socket.current.on("accept", handleCallAcceptance);
        // RNCallKeep.addEventListener("endCall", ()=> {
        //   socket.current.emit("callRejected", detailsRef.current);
        // })
      }
    });

    return () => {
      socket.current.off("playRingtone");
    };
  }, [socket]);

  const initiateAudioCall = () => {
    playSound();
    setTimeout(() => {
      pauseSound();
    }, 15000);
    const details = {
      callerId: currMem.id,
      recipientId: friendId,
      name: currMem.name,
      audioOnly: true,
    };
    socket.current.emit("initiateAudioCall", details);
  };

  const initiateVideoCall = () => {
    playSound();
    setTimeout(() => {
      pauseSound();
    }, 20000);
    const details = {
      callerId: currMem.id,
      recipientId: friendId,
      name: currMem.name,
      audioOnly: false,
    };
    socket.current.emit("initiateAudioCall", details);
  };

  const sendMessage = async () => {
    if (inputMessage.trim() !== "") {
      const formData = new FormData();
      formData.append("MemberToken", currMem?.memberToken);
      formData.append("MessageId", 0);
      formData.append("messageText", inputMessage);
      formData.append("ReceiverID", friendId);
      formData.append("IsCallMsg", false);
      formData.append("EventType", "Click");

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          MemberToken: currMem?.memberToken,
        },
      };

      try {
        const response = await axios.post(
          ConfigLink.sendPrivateMsg,
          formData,
          config
        );
        setInputMessage("");
      } catch (err) {
        console.log("Failed to send message to the server : ", err);
      }
    }
  };

  const renderMessageItem = ({ item }) => {
    const isSentByCurrentUser = item.SenderID == currMem.id;
    const urlRegex1 =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

    const parts = item.Message.split(urlRegex1);
    return (
      <View
        style={[
          Styles.messageView,
          isSentByCurrentUser ? Styles.rightView : Styles.leftView,
        ]}
      >
        {parts.map((part, index) => {
          if (urlRegex1.test(part)) {
            if (isYoutubeUrl(part)) {
              const videoID = extractYouTubeID(part);
              return (
                <YoutubePlayer
                  key={index}
                  height={150}
                  width={250}
                  videoId={videoID}
                  play={false}
                  onChangeState={(event) => console.log(event)}
                />
              );
            } else {
              return (
                <Text
                  key={index}
                  style={[Styles.messageText, Styles.link]}
                  onPress={() => Linking.openURL(part)}
                >
                  {part}
                </Text>
              );
            }
          } else {
            return (
              <Text key={index} style={Styles.messageText}>
                {part}
              </Text>
            );
          }
        })}
      </View>
    );
  };

  return (
    <View style={Styles.mainView}>
      <View style={Styles.userInfo}>
        <Image
          source={
            friendPhoto && typeof friendPhoto === "string"
              ? { uri: friendPhoto }
              : default_photo
          }
          style={Styles.userImage}
        />
        <View style={Styles.dflexWithBetween}>
          <View style={Styles.width80}>
            <Text style={Styles.userName}>{friendName}</Text>
            <Text style={Styles.loginStatus}>Online</Text>
          </View>
          <View style={Styles.dflex}>
            <TouchableOpacity
              onPress={initiateAudioCall}
              style={Styles.callIcon}
            >
              <Image
                source={require("../../assets/images/audio-call.png")}
                style={Styles.callIconImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={initiateVideoCall}
              style={Styles.callIcon}
            >
              <Image
                source={require("../../assets/images/video-call.png")}
                style={Styles.callIconImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <FlatList
        data={messageList}
        keyExtractor={(item, index) => `${index}`}
        renderItem={renderMessageItem}
        extraData={currMem}
        style={{ marginTop: 10 }}
      />
      <View style={Styles.inputContainer}>
        <TextInput
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message..."
          style={Styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={Styles.sendButton}>
          <Text style={Styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Styles = StyleSheet.create({
  mainView: {
    backgroundColor: "#f1f1f1",
    textAlign: "center",
    height: "100%",
    marginTop: 50,
  },
  width80: {
    width: "70%",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
  dflex: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
  },
  dflexWithBetween: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    padding: 10,
    zIndex: 9,
    position: "absolute",
  },
  loginStatus: {
    fontSize: 10,
  },
  userImage: {
    width: 30,
    height: 30,
    backgroundColor: "#ddd",
    marginRight: 15,
    marginLeft: 15,
    borderRadius: 100,
  },
  userName: {
    fontSize: 14,
    fontWeight: "500",
  },
  callIcon: {
    width: 30,
    height: 30,
    backgroundColor: "#ddd",
    padding: 8,
    marginRight: 5,
    borderRadius: 100,
  },
  callIconImage: {
    width: 15,
    height: 15,
  },
  messageList: {
    flex: 1,
  },
  messageView: {
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: "80%",
  },
  rightView: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  leftView: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#ffffff",
  },
});

export default Message;
