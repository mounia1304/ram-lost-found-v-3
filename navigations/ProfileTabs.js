import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Imports des composants simples
import HomeScreen from "../screens/Profile/HomeScreen";
import NotificationsScreen from "../screens/Profile/NotificationScreen";
import UserProfileScreen from "../screens/Profile/profileScreen";
import ObjectDetailsScreen from "../screens/Profile/objectDetailsScreen";
const Tab = createBottomTabNavigator();
console.log("HomeScreen:", HomeScreen);
console.log("NotificationsScreen:", NotificationsScreen);
console.log("ProfileScreen:", UserProfileScreen);
export default function ProfileTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#D80000",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Notifications") {
            iconName = focused ? "notifications" : "notifications-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
    </Tab.Navigator>
  );
}
