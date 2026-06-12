import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Keyboard,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { useTranslation } from "react-i18next";
import { auth } from "@/firebase";
import { useScreen } from "@/providers/ScreenProvider";
import Header from "@/components/common/Header";
import Screen from "@/components/common/Screen";
import createUser from "@/api/users/createUser";
import InputField from "@/components/common/InputField";

const APP_ROUTE = "/(app)/(tabs)";

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { setIsLoading } = useScreen();
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) {
      setError(true);
      setErrorMessage(t("name_required"));
      return false;
    }
    if (!formData.email.trim()) {
      setError(true);
      setErrorMessage(t("email_required"));
      return false;
    }
    if (formData.password.length < 6) {
      setError(true);
      setErrorMessage(t("password_length"));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(true);
      setErrorMessage(t("passwords_dont_match"));
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    Keyboard.dismiss();
    setError(false);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      await updateProfile(credential.user, { displayName: formData.name });
      await createUser({
        uid: credential.user.uid,
        name: formData.name,
        email: formData.email,
      });
      router.replace(APP_ROUTE);
    } catch (error: unknown) {
      const errorCode = (error as Partial<FirebaseError>).code;

      setError(true);
      setErrorMessage(
        errorCode === "auth/email-already-in-use"
          ? t("email_in_use")
          : t("error_generic")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isIncomplete =
    !formData.name.trim() ||
    !formData.email.trim() ||
    formData.password.length < 6 ||
    formData.password !== formData.confirmPassword;

  return (
    <Screen>
      <Header title={t("create_account")} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-6 pb-8">
          <View className="items-center mb-8">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl border border-[#DAD6E4] bg-[#F1EFF7] dark:border-[#4B415C] dark:bg-[#2A2234]">
              <Ionicons name="person-add-outline" size={36} color="#8F7DCC" />
            </View>
            <Text
              className="mb-1 text-center text-3xl text-[#5E5082] dark:text-[#D8CEF5]"
              style={{ fontFamily: "serif" }}
            >
              {t("create_account")}
            </Text>
            <Text className="text-center text-base text-[#7D7789] dark:text-[#AFA7C1]">
              {t("fill_details")}
            </Text>
          </View>

          <InputField
            icon="person-outline"
            placeholder={t("full_name")}
            value={formData.name}
            onChangeText={(v: string) => handleChange("name", v)}
            autoCapitalize="words"
          />
          <InputField
            icon="mail-outline"
            placeholder={t("email_address")}
            value={formData.email}
            onChangeText={(v: string) => handleChange("email", v)}
            keyboardType="email-address"
          />
          <InputField
            icon="lock-closed-outline"
            placeholder={t("password")}
            value={formData.password}
            onChangeText={(v: string) => handleChange("password", v)}
            secureTextEntry
          />
          <InputField
            icon="lock-closed-outline"
            placeholder={t("confirm_password")}
            value={formData.confirmPassword}
            onChangeText={(v: string) => handleChange("confirmPassword", v)}
            secureTextEntry
          />

          {error && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-red-400 text-sm ml-2 flex-1">
                {errorMessage}
              </Text>
            </View>
          )}

          <Pressable
            onPress={onSubmit}
            disabled={isIncomplete}
            className={`rounded-2xl p-4 items-center mt-2 mb-6 shadow-lg ${
              isIncomplete
                ? "bg-[#DAD6E4] dark:bg-[#4B415C]"
                : "bg-[#5E5082] active:bg-[#4F436E] dark:bg-[#8F7DCC]"
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text className="text-white text-base font-bold ml-2">
                {t("create_account")}
              </Text>
            </View>
          </Pressable>

          <View className="flex-row justify-center items-center">
            <Text className="text-sm text-[#7D7789] dark:text-[#AFA7C1]">
              {t("already_have_account")}{" "}
            </Text>
            <Pressable onPress={() => router.push("/(auth)")}>
              <Text className="text-sm font-bold text-[#5E5082] dark:text-[#D8CEF5]">
                {t("sign_in")}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
