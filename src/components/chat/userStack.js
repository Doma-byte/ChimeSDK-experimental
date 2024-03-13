import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Friends from "./friends";
import Message from "./message1";
import Chime from "../../Chime";

const Stack = createStackNavigator();

const userStack = () => {
  return (
    <Stack.Navigator initialRouteName="Friends">
      <Stack.Screen
        name="Friends"
        component={Friends}
        options={{ title: "Friends", headerShown: false }}
      />
      <Stack.Screen
        name="Message"
        component={Message}
        options={{ title: "Message", headerShown: false }}
      />
      <Stack.Screen
        name="Chime"
        component={Chime}
        options={{ title: "Chime", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default userStack;
