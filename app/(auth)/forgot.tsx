import React, { useState } from "react";
import { View, TextInput, Text, Alert, Pressable } from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useScreen } from "../../providers/ScreenProvider";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Header from "@/components/common/Header";
import Screen from "@/components/common/Screen";

export default function ForgotScreen() {
  const { t } = useTranslation();
  const auth = getAuth();
  const { setIsLoading } = useScreen();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = (email: string) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const onSubmit = async () => {
    setIsLoading(true);
    if (!isValidEmail(email)) {
      setError(true);
      setErrorMessage(t("email_invalid"));
      setIsLoading(false);
      return;
    }
    setError(false);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        t("email_sent_title"),
        t("email_sent_message", { email }),
        [{ text: t("ok") }]
      );
      router.push("/(auth)");
    } catch {
      setError(true);
      setErrorMessage(t("error_reset_email"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <Header title={t("reset_password")} />
      <View className="flex-1 p-6 justify-center">
        <View className="mb-8">
          <Text
            className="mb-2 text-center text-3xl text-[#5E5082] dark:text-[#D8CEF5]"
            style={{ fontFamily: "serif" }}
          >
            {t("forgot_password_title")}
          </Text>
          <Text className="text-center text-base text-[#7D7789] dark:text-[#AFA7C1]">
            {t("forgot_password_subtitle")}
          </Text>
        </View>

        <View className="mb-6">
          <TextInput
            className="mb-2 rounded-2xl border border-[#E8E5EE] bg-white p-4 text-base text-[#2E2A36] dark:border-[#31293D] dark:bg-[#201A29] dark:text-[#F4F0FA]"
            placeholder={t("email_address")}
            placeholderTextColor="#A39EBC"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
          {error && (
            <Text className="text-red-400 text-sm mt-1">{errorMessage}</Text>
          )}
        </View>

        <Pressable
          onPress={onSubmit}
          className="mb-4 items-center rounded-2xl bg-[#5E5082] p-4 active:bg-[#4F436E] dark:bg-[#8F7DCC]"
        >
          <Text className="text-white text-base font-semibold">{t("send_reset_link")}</Text>
        </Pressable>

        <View className="flex-row justify-center items-center">
          <Text className="text-sm text-[#7D7789] dark:text-[#AFA7C1]">{t("remember_password")} </Text>
          <Pressable
            onPress={() => router.push("/(auth)")}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text className="text-sm font-semibold text-[#5E5082] dark:text-[#D8CEF5]">{t("sign_in")}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
