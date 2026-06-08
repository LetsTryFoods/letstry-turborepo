import React, { createContext, useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ActionEngine, SDUIAction } from "../ActionEngine";
import { SDUIRenderer } from "../SDUIRenderer";

interface FormContextType {
  values: Record<string, any>;
  setValue: (field: string, value: any) => void;
  submitForm: (action?: SDUIAction) => void;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextType | null>(null);

export const useSDUIForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("Form components must be rendered inside an SDUIForm");
  }
  return context;
};

interface SDUIFormProps {
  fields: any[]; // The SDUI components inside the form
  onSubmit?: SDUIAction;
  padding?: number;
}

export const SDUIForm: React.FC<SDUIFormProps> = ({
  fields,
  onSubmit,
  padding = 16,
}) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async (action?: SDUIAction) => {
    const finalAction = action || onSubmit;
    if (!finalAction) return;

    setIsSubmitting(true);

    try {
      // Inject form values into the payload if it's an API call
      if (finalAction.type === "API_CALL" && finalAction.payload) {
        // Deep clone payload to avoid mutating the original config
        const payloadStr = JSON.stringify(finalAction.payload);

        // Simple string replacement for "${form.fieldName}"
        const injectedPayloadStr = payloadStr.replace(
          /\$\{form\.([a-zA-Z0-9_]+)\}/g,
          (match, fieldName) => {
            return values[fieldName] || "";
          },
        );

        const injectedAction = {
          ...finalAction,
          payload: JSON.parse(injectedPayloadStr),
        };

        await ActionEngine.execute(injectedAction);
      } else {
        await ActionEngine.execute(finalAction);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider
      value={{ values, setValue, submitForm, isSubmitting }}
    >
      <View style={[styles.container, { padding }]}>
        <SDUIRenderer components={fields} />
      </View>
    </FormContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

export default SDUIForm;
