import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/homeScreen";
import ReportFoundScreen from "../screens/reportFound/reportFoundScreen";
import FoundChoiceScreen from "../screens/reportFound/where";
import QRCodeScreen from "../screens/reportFound/QRCodeScreen";
import LoginScreen from "../screens/auth/loginScreen";
import RegisterScreen from "../screens/auth/registerScreen";
import ForgotPasswordScreen from "../screens/auth/forgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/resetPasswordScreen";
import ReportLostScreen from "../screens/reportLost/reportLostScreen";
//import SearchReportScreen from "../screens/searchReportScreen";
import ProfileTabs from "./ProfileTabs";
const Stack = createStackNavigator();
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
      <Stack.Screen name="Reportfound" component={ReportFoundScreen} />
      <Stack.Screen name="FoundChoice" component={FoundChoiceScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ReportLost" component={ReportLostScreen} />
      <Stack.Screen name="Profile" component={ProfileTabs} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
//       <Stack.Screen name="SearchReport" component={SearchReportScreen} />
