import React from "react";
import { View, TextInput, KeyboardTypeOptions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

const InputFieldComponent = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
}: InputFieldProps) => (
  <View className="mb-4">
    <View className="flex-row items-center rounded-2xl border border-[#E8E5EE] bg-white dark:border-[#31293D] dark:bg-[#201A29]">
      <View className="pl-4 pr-3">
        <Ionicons name={icon} size={20} color="#A39EBC" />
      </View>
      <TextInput
        className="flex-1 py-4 pr-4 text-base text-[#2E2A36] dark:text-[#F4F0FA]"
        placeholder={placeholder}
        placeholderTextColor="#A39EBC"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        textContentType={secureTextEntry ? "oneTimeCode" : undefined}
        autoComplete="off"
      />
    </View>
  </View>
);

const InputField = React.memo(InputFieldComponent);
InputField.displayName = "InputField";

export default InputField;
