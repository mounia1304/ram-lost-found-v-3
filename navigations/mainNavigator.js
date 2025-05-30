import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/homeScreen';
import ReportFoundScreen from '../screens/reportFound/reportFoundScreen';
import ReportLostScreen from '../screens/reportLost/reportLostScreen';
import ProfileScreen from'../screens/profile/profileScreen';
const Stack = createStackNavigator();
const mainNavigator = () => {
  return (
<Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
<Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="ReportFound" component={ReportFoundScreen} />
  <Stack.Screen name="ReportLost" component={ReportLostScreen} />
  <Stack.Screen name="Profile" component={ProfileScreen} />
</Stack.Navigator>
  );
};
export default mainNavigator;