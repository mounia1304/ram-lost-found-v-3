import React from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

const Button = ({ title, onPress, loading, disabled, style, textStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#c2002f",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
    marginBottom: 60,
  },
  disabled: {
    backgroundColor: "#999", // gris pour indiquer inactif
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Button;
