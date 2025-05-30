import React from "react";
import { Text, StyleSheet } from "react-native";

export default function SubTitle({ text }) {
  return <Text style={styles.title}>{text}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
    color: "#000",
  },
});
