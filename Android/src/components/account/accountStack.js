import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "./login";
import Signup from "./signup";

const accountStack = (props) => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} options={{ title: "" }} />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ title: "Login" }}
      />
    </Stack.Navigator>
  );
};

export default accountStack;
