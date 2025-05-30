// si authentifié -> mainNavigator.js
//non authentifié -> authnavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/auth/loginScreen";
import RegisterScreen from "../screens/auth/registerScreen";
import ForgotPasswordScreen from "../screens/auth/forgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/resetPasswordScreen";
import HomeScreen from "../screens/homeScreen";
import ReportFoundScreen from "../screens/reportFound/reportFoundScreen";
import ReportLostScreen from "../screens/reportLost/reportLostScreen";
//import ProfileScreen from "../screens/profile/profileScreen";
import FoundChoiceScreen from "../screens/reportFound/where";
import QRCodeScreen from "../screens/reportFound/QRCodeScreen";
//import SearchReportScreen from "../screens/searchReportScreen";
//import ReportDetailScreen from "../screens/reportDetailsScreen";
const Stack = createStackNavigator();
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ReportFound" component={ReportFoundScreen} />
      <Stack.Screen name="ReportLost" component={ReportLostScreen} />
      <Stack.Screen name="FoundChoice" component={FoundChoiceScreen} />
      <Stack.Screen name="QRCode" component={QRCodeScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
// <Stack.Screen name="searchReport" component={SearchReportScreen} />
//<Stack.Screen name="Reportdetails" component={ReportDetailScreen} /><Stack.Screen name="profile" component={ProfileScreen} />
