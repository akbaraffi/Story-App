import Swal from "sweetalert2";
import { convertBase64ToUint8Array } from "./index";
import CONFIG from "../config";
import {
  subscribePushNotification,
  unsubscribePushNotification,
} from "../data/api";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    Swal.fire({
      icon: "error",
      title: "Izin Ditolak",
      text: "Izin notifikasi ditolak.",
    });
    return false;
  }

  if (status === "default") {
    Swal.fire({
      icon: "warning",
      title: "Izin Diabaikan",
      text: "Izin notifikasi ditutup atau diabaikan.",
    });
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  if (!registration) return null;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    Swal.fire({
      icon: "info",
      title: "Sudah Berlangganan",
      text: "Sudah berlangganan push notification.",
    });
    return;
  }

  console.log("Mulai berlangganan push notification...");

  const failureSubscribeMessage =
    "Langganan push notification gagal diaktifkan.";
  const successSubscribeMessage =
    "Langganan push notification berhasil diaktifkan.";
  let pushSubscription;
  try {
    const registration = await navigator.serviceWorker.ready;
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions(),
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });
    if (!response.ok) {
      console.error("subscribe: response:", response);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: failureSubscribeMessage + " - " + response.message,
      });
      await pushSubscription.unsubscribe();
      return;
    }

    await registration.showNotification("Berhasil Subscribe!", {
      body: "Anda akan menerima notifikasi untuk cerita baru.",
      icon: "/favicon.png",
    });

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: successSubscribeMessage,
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("subscribe: error:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: failureSubscribeMessage + " - " + error.message,
    });
    if (pushSubscription) {
      await pushSubscription.unsubscribe();
    }
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage =
    "Langganan push notification gagal dinonaktifkan.";
  const successUnsubscribeMessage =
    "Langganan push notification berhasil dinonaktifkan.";
  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      Swal.fire({
        icon: "info",
        title: "Info",
        text: "Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.",
      });
      return;
    }
    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });
    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: failureUnsubscribeMessage,
      });
      console.error("unsubscribe: response:", response);
      return;
    }
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: failureUnsubscribeMessage,
      });
      await subscribePushNotification({ endpoint, keys });
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("Berhasil Unsubscribe", {
      body: "Anda tidak akan lagi menerima notifikasi.",
      icon: "/favicon.png",
    });

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: successUnsubscribeMessage,
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: failureUnsubscribeMessage,
    });
    console.error("unsubscribe: error:", error);
  }
}
