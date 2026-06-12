import { maxVoiceRecordingSeconds } from "@/constants/sorae";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const mimeTypeFromUri = (uri: string) => {
  if (uri.endsWith(".webm")) return "audio/webm";
  if (uri.endsWith(".wav")) return "audio/wav";
  if (uri.endsWith(".aac")) return "audio/aac";

  return "audio/m4a";
};

type UseVoiceReflectionOptions = {
  sendVoiceMessage: (audioBase64: string, mimeType: string) => Promise<void>;
  isDisabled?: boolean;
};

export const useVoiceReflection = ({
  sendVoiceMessage,
  isDisabled = false,
}: UseVoiceReflectionOptions) => {
  const { t } = useTranslation();
  const [voiceError, setVoiceError] = useState("");
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const startRecording = useCallback(async () => {
    if (isDisabled) return;

    setVoiceError("");

    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        setVoiceError(t("sorae_voice_permission_denied"));
        return;
      }

      await Haptics.selectionAsync();
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });
      await recorder.prepareToRecordAsync();
      recorder.record({ forDuration: maxVoiceRecordingSeconds });
    } catch {
      setVoiceError(t("sorae_voice_start_failed"));
    }
  }, [isDisabled, recorder, t]);

  const stopRecording = useCallback(async () => {
    if (isDisabled) return;

    try {
      await recorder.stop();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const uri = recorder.uri ?? recorderState.url;

      if (!uri) {
        setVoiceError(t("sorae_voice_read_failed"));
        return;
      }

      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await sendVoiceMessage(audioBase64, mimeTypeFromUri(uri));
    } catch {
      setVoiceError(t("sorae_voice_process_failed"));
    }
  }, [isDisabled, recorder, recorderState.url, sendVoiceMessage, t]);

  const toggleRecording = useCallback(async () => {
    if (recorderState.isRecording) {
      await stopRecording();
      return;
    }

    await startRecording();
  }, [recorderState.isRecording, startRecording, stopRecording]);

  return {
    isRecording: recorderState.isRecording,
    voiceError,
    clearVoiceError: () => setVoiceError(""),
    toggleRecording,
  };
};
