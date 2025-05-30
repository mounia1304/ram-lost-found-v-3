import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const Input = ({ placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      style={styles.input}
      autoCapitalize="none"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
});

export default Input;
