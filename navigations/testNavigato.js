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
import ClaimLookupScreen from "../screens/searchReportScreen";
import ProfileTabs from "./ProfileTabs";
import ObjectDetailsScreen from "../screens/Profile/objectDetailsScreen";
import AuthLoadingScreen from "../screens/AuthLoadingScreen";
const Stack = createStackNavigator();
const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="AuthLoading">
      <Stack.Screen
        name="AuthLoading"
        component={AuthLoadingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QRCode"
        component={QRCodeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reportfound"
        component={ReportFoundScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FoundChoice"
        component={FoundChoiceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReportLost"
        component={ReportLostScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profileTabs"
        component={ProfileTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ObjectDetails"
        component={ObjectDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SearchDoc"
        component={ClaimLookupScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
//       <Stack.Screen name="SearchReport" component={SearchReportScreen} />
