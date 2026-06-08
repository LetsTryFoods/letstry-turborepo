import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { useSDUIForm } from "./SDUIForm";

interface SDUITextInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  secureTextEntry?: boolean;
}

export const SDUITextInput: React.FC<SDUITextInputProps> = ({
  name,
  label,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
}) => {
  const { values, setValue } = useSDUIForm();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={values[name] || ""}
        onChangeText={(text) => setValue(name, text)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#000",
  },
});

export default SDUITextInput;
