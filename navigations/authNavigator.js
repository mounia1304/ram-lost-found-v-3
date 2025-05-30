import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/auth/loginScreen";
import RegisterScreen from "../screens/auth/registerScreen";
import ForgotPasswordScreen from "../screens/auth/forgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/resetPasswordScreen";
import HomeScreen from "../screens/homeScreen";
const Stack = createStackNavigator();
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
