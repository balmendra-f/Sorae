import { FC } from "react";
import { Pressable, Text, type GestureResponderEvent } from "react-native";

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  buttonClassName?: string;
  textClassName?: string;
}

const Button: FC<ButtonProps> = ({
  label,
  onPress,
  disabled,
  buttonClassName,
  textClassName,
}) => {
  return (
    <Pressable
      className={`items-center rounded-2xl bg-[#5E5082] p-4 dark:bg-[#8F7DCC] ${buttonClassName}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={`text-white text-xl font-bold ${textClassName}`}>
        {label}
      </Text>
    </Pressable>
  );
};

export default Button;
