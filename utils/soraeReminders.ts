import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { OnboardingPreferences } from "@/types/sorae";
import i18n from "@/i18n";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const createReminderContent = () => ({
  title: "Sorae",
  body: i18n.t("sorae_notification_reflection_body"),
  data: { screen: "chat" },
});

export const syncSoraeReminders = async (
  cadence: OnboardingPreferences["reminderCadence"],
) => {
  if (Platform.OS === "web") return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (cadence === "none") return;

  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return;

  if (cadence === "weekly") {
    await Notifications.scheduleNotificationAsync({
      content: createReminderContent(),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1,
        hour: 20,
        minute: 30,
      },
    });
    return;
  }

  if (cadence === "weekdays") {
    await Promise.all(
      [2, 3, 4, 5, 6].map((weekday) =>
        Notifications.scheduleNotificationAsync({
          content: createReminderContent(),
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour: 20,
            minute: 30,
          },
        }),
      ),
    );
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: createReminderContent(),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 30,
    },
  });
};
