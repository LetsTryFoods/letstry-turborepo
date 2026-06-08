import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSDUIForm } from "./SDUIForm";
import { SDUIAction, ActionEngine } from "../ActionEngine";

interface SDUIButtonProps {
  label: string;
  action?: SDUIAction;
  backgroundColor?: string;
  textColor?: string;
  isSubmit?: boolean; // If true, it triggers the form context submit instead of direct execution
}

export const SDUIButton: React.FC<SDUIButtonProps> = ({
  label,
  action,
  backgroundColor = "#0C5273",
  textColor = "#FFFFFF",
  isSubmit = false,
}) => {
  // We use optional chaining here because a standalone button might not be inside a form
  const formContext = isSubmit ? useSDUIForm() : null;
  const isSubmitting = formContext?.isSubmitting || false;

  const handlePress = async () => {
    if (isSubmitting) return;

    if (isSubmit && formContext) {
      // Trigger form submission
      await formContext.submitForm(action);
    } else if (action) {
      // Trigger standalone action
      await ActionEngine.execute(action);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={handlePress}
      disabled={isSubmitting}
      activeOpacity={0.8}
    >
      {isSubmitting ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default SDUIButton;
