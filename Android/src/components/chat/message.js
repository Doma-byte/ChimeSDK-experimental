import { AsyncStorage } from "react-native";
import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { AuthCtx } from "../../App";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Linking,
  useWindowDimensions,
  AppStateStatus,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { WebView } from "react-native-webview";
import RenderHTML from "react-native-render-html";
import Sound from "react-native-sound";
import io from "socket.io-client";
import ringtone from "../../assets/ringtone.mp3";
import { NativeModules } from "react-native";
import notifee, { AndroidImportance, EventType } from "@notifee/react-native";

const { RNRingtone } = NativeModules;

Sound.setCategory("Playback", true);
const Message = ({ route, navigation }) => {
  const socket = io("https://r336cx6c-3000.inc1.devtunnels.ms/");
  const [messageList, setMessage] = useState([]);
  const [currMem, setMember] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const { friendId, friendName, friendPhoto } = route.params;
  const [meetingId, setMeetingId] = useState(null);
  const { width } = useWindowDimensions();
  const detailsRef = useRef(null);

  const ring = new Sound(ringtone, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.log("Failed to load sound file ", error);
    } else {
      ring.setVolume(1.0);
    }
  });

  const navigateToChimeScreen = (details) => {
    navigation.navigate("Chime", {
      meetingName: details.meetingId,
      userName: currMem.name,
    });
  };

  const onDisplayNotification = async (details) => {
    try {
      const channelId = await notifee.createChannel({
        id: "default",
        name: "Default Channel",
      });

      const actions = [
        {
          title: "Accept",
          pressAction: {
            id: "accept",
            launchActivity: "default",
          },
        },
        {
          title: "Reject",
          pressAction: {
            id: "reject",
          },
        },
      ];

      await notifee.displayNotification({
        title: "Notification Title",
        body: details.meetingId,
        android: {
          channelId,
          actions,
          presentation: {
            position: "head",
          },
          importance: AndroidImportance.HIGH,
        },
      });
    } catch (error) {
      console.error("Error displaying notification:", error);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("userName")
      .then((val) => {
        var value = JSON.parse(val);
        setMember(value);
        axios
          .get(
            "http://memberapiqa.actpal.com/api/message?senderId=" +
              value.id +
              "&recieverId=" +
              friendId +
              "&start=30&length=1"
          )
          .then((Response) => {
            setMessage(Response.data);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const room = "9876543847388210";
    socket.emit("join", room);

    socket.on("connect_error", (err) => {
      console.log("Socket connection error:", err);
    });
    socket.on("receiveMessage", (message) => {
      setMessage((prevMessages) => [...prevMessages, message.message]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    socket.on("playRingtone", (details) => {
      detailsRef.current = details;
      if (details.callerId === currMem.id) {
        navigateToChimeScreen(details);
      } else if (details.recipientId === currMem.id) {
        onDisplayNotification(details);
        RNRingtone.play();
        setTimeout(() => {
          RNRingtone.stop();
        }, 20000);
      }
      notifee.onForegroundEvent(async ({ type, detail }) => {
        if (type === EventType.ACTION_PRESS && detail) {
          if (detail.pressAction.id === "accept") {
            RNRingtone.stop();
            ring.release();
            navigateToChimeScreen(detailsRef.current);
          } else if (detail.pressAction.id === "reject") {
            RNRingtone.stop();
            ring.release();
          }
        }
      });

      notifee.onBackgroundEvent(async ({type, detail})=>{
        if(type === EventType.ACTION_PRESS && detail){
          if(detail.pressAction.id === "accept"){
            RNRingtone.stop();
            ring.release();
            navigateToChimeScreen(detailsRef.current);
          }else if(detail.pressAction.id === "reject"){
            RNRingtone.stop();
            ring.release();
          }
        }
      })
    });

    return () => {
      RNRingtone.stop();
      socket.off("playRingtone");
    };
  }, [socket, ring]);

  const initiateAudioCall = () => {
    ring.play();
    setTimeout(() => {
      ring.release();
    }, 20000);
    ring.setNumberOfLoops(-1);
    const details = {
      callerId: currMem.id,
      recipientId: friendId,
      name: currMem.name,
    };
    socket.emit("initiateAudioCall", details);
  };

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      const messageData = {
        senderId: currMem.id,
        recipientId: friendId,
        message: inputMessage,
      };
      socket.emit("sendMessage", messageData);
      setInputMessage("");
      setMessage((prevMessages) => [...prevMessages, messageData.message]);
    }
  };

  return (
    <View style={Styles.mainView}>
      <View style={Styles.userInfo}>
        <Image source={{ uri: friendPhoto }} style={Styles.userImage} />
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
              onPress={() => videoCall()}
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
      <View style={Styles.messageListView}>
        <FlatList
          style={Styles.messageList}
          data={messageList}
          keyExtractor={(item) => item.Id}
          renderItem={({ item, index }) =>
            item.SenderID == currMem.id ? (
              <View
                style={[Styles.messageView, Styles.rightView]}
                key={{ index }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    width: 170,
                    justifyContent: "flex-end",
                  }}
                >
                  <View style={Styles.messageDetails}>
                    <Text style={Styles.userName}>{item.Mem_Name}</Text>
                    <RenderHTML
                      contentWidth={width}
                      source={{ html: item.Message }}
                    />
                    <WebView
                      useWebKit={true}
                      source={{ html: "Hello world" }}
                    />
                    <Text
                      style={{ color: "red" }}
                      onPress={() => {
                        Linking.openURL("http://www.example.com/");
                      }}
                    >
                      Send
                    </Text>
                  </View>
                  <Image
                    source={{ uri: item.Mem_photo }}
                    style={Styles.userImage}
                  />
                </View>
              </View>
            ) : (
              <View style={[Styles.messageView, Styles.leftView]} key={index}>
                <Image
                  source={{ uri: item.Mem_photo }}
                  style={Styles.userImage}
                />
                <View style={Styles.messageDetails}>
                  <Text style={Styles.userName}>{item.Mem_Name}</Text>
                  <RenderHTML
                    contentWidth={width}
                    source={{ html: item.Message }}
                  />
                  <Text
                    style={{ color: "red" }}
                    onPress={() => {
                      Linking.openURL("http://www.example.com/");
                    }}
                  >
                    "receiveMessage"
                  </Text>
                  <WebView
                    useWebKit={true}
                    source={{ uri: "https://erp.schoolaura.com" }}
                  />
                </View>
              </View>
            )
          }
        />
      </View>
      <View style={Styles.messageInputBox}>
        <TextInput
          style={Styles.messageInput}
          placeholder="Type message..."
          value={inputMessage}
          onChangeText={(text) => setInputMessage(text)}
        />
        <TouchableOpacity style={Styles.messageSendBtn} onPress={sendMessage}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Message;

const Styles = StyleSheet.create({
  mainView: {
    backgroundColor: "#f1f1f1",
    textAlign: "center",
    height: "100%",
  },
  width80: {
    width: "70%",
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
  messageListView: {
    paddingBottom: 70,
    paddingTop: 48,
    height: "100%",
    fontSize: 12,
    backgroundColor: "#ddd",
  },
  messageList: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 10,
    paddingBottom: 10,
    borderBottomColor: "#ddd",
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  messageView: {
    maxWidth: "100%",
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
  },
  leftView: {
    color: "#000",
    left: -15,
  },
  rightView: {
    justifyContent: "flex-end",
    right: -15,
  },
  messageDetails: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginBottom: 15,
    maxWidth: "70%",
    flex: 1,
    borderRadius: 10,
    flexDirection: "column",
  },
  messageInputBox: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    position: "absolute",
    bottom: 0,
    minheight: 70,
    width: "100%",
    backgroundColor: "#fff",
    zIndex: 2,
  },
  messageInput: {
    textAlign: "left",
    width: "80%",
    minHeight: 40,
    borderRadius: 15,
    backgroundColor: "#f1f1f1",
    marginBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  messageSendBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#818181",
  },
});
