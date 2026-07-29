import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermission() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }
  return true;
}

export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  dueDate: string
) {
  const granted = await requestPermission();
  if (!granted) return null;

  const due = new Date(dueDate);
  const now = new Date();
  const seconds = Math.floor((due.getTime() - now.getTime()) / 1000);

  if (seconds <= 0) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Task Reminder",
      body: `"${title}" is due soon`,
      data: { taskId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.min(seconds, 86400 * 7),
    },
  });

  return id;
}

export async function cancelReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
