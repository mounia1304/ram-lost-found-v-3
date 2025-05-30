import React from "react";
import { View, TouchableOpacity } from "react-native";
export default function ColorPicker({ onSelectColor }) {
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#808080",
    "#C0C0C0",
    "#800000",
    "#808000",
    "#008000",
    "#800080",
    "#008080",
    "#FFA500",
    "#A52A2A",
    "#FFCCCB",
    "#ADD8E6",
    "#FFD700",
  ];

  return (
    <View style={{ flexWrap: "wrap", flexDirection: "row", marginBottom: 10 }}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => onSelectColor(color)}
          style={{
            backgroundColor: color,
            width: 40,
            height: 40,
            margin: 5,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#333",
          }}
        />
      ))}
    </View>
  );
}
