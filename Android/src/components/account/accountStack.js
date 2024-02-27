import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "./login";
import Signup from "./signup";

const accountStack = ({setName}) => {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login">
        {(props) => <Login {...props} setName={setName} />}
      </Stack.Screen>
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{ title: "Login" }}
      />
    </Stack.Navigator>
  );
};

export default accountStack;
