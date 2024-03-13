import { AsyncStorage } from "react-native";
import axios from "axios";
import { AuthCtx } from "../../App";
import Configs from "../config/config";
import React, { useContext, useEffect, useState } from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
const default_photo = require("../../assets/images/default-profile.png");

const Friends = ({ navigation }) => {
  const [myFriends, setFriends] = useState(null);
  const { userName, setName } = useContext(AuthCtx);
  var value1 = JSON.parse(userName);
  useEffect(() => {
        const link =
          Configs.FriendListURL + value1.memberToken + "&page=1&pageSize=100";
        try {
          axios
            .get(link)
            .then(response => {
              console.log('The response data is: ', response.data.Mem_ID);
              setFriends(response.data);
            });
        } catch (err) {
          console.log('Error : ', err);
        }
  }, []);

  function Logout() {
    setName(null);
    AsyncStorage.removeItem("userName");
  }

  function chatStart(friendInfo) {
    navigation.navigate("Message", {
      friendId: friendInfo.Mem_ID,
      friendName: friendInfo.Mem_Name,
      friendPhoto: friendInfo.Mem_Photo,
    });
  }

  return (
    <View>
      <View style={Styles.header}>
        <Text>{value1.name}</Text>
        <TouchableOpacity onPress={() => Logout()}>
          <Text style={Styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={Styles.friendListView}>
        <ScrollView>
          <FlatList
            style={Styles.mainView}
            data={myFriends}
            keyExtractor={(item) => item.Id}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={Styles.userInfo}
                onPress={() => chatStart(item)}
                key={{ index }}
              >
                <Image
                  source={
                    item.Mem_Photo && typeof item.Mem_Photo === "string"
                      ? { uri: item.Mem_Photo }
                      : default_photo
                  }
                  style={Styles.userImage}
                />
                <View>
                  <Text style={Styles.userName}>{item.Mem_Name}</Text>
                  <Text style={Styles.userName}>11 Mutual Friends</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default Friends;

const Styles = StyleSheet.create({
  mainView: {
    backgroundColor: "#fff",
    padding: 15,
    textAlign: "center",
    height: "100%",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    zIndex: 9,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    width: "100%",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  userImage: {
    width: 50,
    height: 50,
    backgroundColor: "#ddd",
    marginRight: 15,
    borderRadius: 100,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    textTransform:'capitalize'
  },
});
