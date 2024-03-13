import axios from "axios";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  CheckBox,
  ScrollView,
} from "react-native";

const Signup = ({ navigation }) => {
  const [value, setValue] = useState(null);
  const [data, facebook] = useState(null);
  const loginEvent = () => {
    if (value != null && value != "") {
      axios
        .get("https://jsonplaceholder.typicode.com/users")
        .then((Response) => {
          console.log(Response);
        });
    } else {
      console.log("not ok");
    }
  };

  return (
    <ScrollView style={Styles.mainView}>
      <View>
        <View>
          <Image
            source={require("../../assets/images/logo.png")}
            style={Styles.logo}
          />
        </View>
        <Text style={Styles.title}>Sign Up!</Text>
        <Text style={Styles.subTitle}>Login to your account to continue</Text>

        <Text style={Styles.inputLable}>Email Address</Text>
        <TextInput
          value={value}
          onChangeText={(e) => {
            setValue(e);
          }}
          placeholder="Enter Your Email Address"
          style={Styles.inputBox}
        />

        <Text style={Styles.inputLable}>Your Password</Text>
        <TextInput
          placeholder="Enter Your Password"
          secureTextEntry={true}
          style={Styles.inputBox}
        />

        <TouchableOpacity onPress={loginEvent} style={{ marginTop: 15 }}>
          <Text style={Styles.buttonStyle}>Sign Up</Text>
        </TouchableOpacity>
        <Text style={{ margin: 15, textAlign: "center", fontSize: 18 }}>
          Or
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={Styles.buttonStyle}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Signup;
const Styles = StyleSheet.create({
  mainView: {
    backgroundColor: "#fff",
    padding: 15,
    textAlign: "center",
    height: "100%",
  },
  logo: {
    width: "100%",
    height: 40,
    flex: 0,
    marginTop: 20,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    color: "#000",
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
  },
  subTitle: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 20,
  },
  inputBox: {
    borderColor: "#ddd",
    borderWidth: 1,
    color: "#000",
    marginBottom: 10,
    width: "100%",
    fontSize: 16,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  inputLable: {
    fontSize: 16,
    lineHeight: 24,
    color: "#212529",
    marginBottom: 5,
  },
  buttonStyle: {
    backgroundColor: "#1866B4",
    color: "#fff",
    padding: 15,
    paddingBottom: 10,
    paddingTop: 10,
    width: "100%",
    fontSize: 16,
    textAlign: "center",
    borderRadius: 8,
  },
});
