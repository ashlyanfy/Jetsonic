import { api } from "./api";

interface PublicKeyResponse {
  publicKey: string | null;
  enabled: boolean;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export type PushStatus =
  | "unsupported"
  | "disabled-server"
  | "permission-denied"
  | "not-subscribed"
  | "subscribed";

export async function getPushStatus(): Promise<PushStatus> {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";

  let keyInfo: PublicKeyResponse;
  try {
    keyInfo = await api<PublicKeyResponse>("/push/public-key");
  } catch {
    return "disabled-server";
  }
  if (!keyInfo.enabled || !keyInfo.publicKey) return "disabled-server";

  if (Notification.permission === "denied") return "permission-denied";

  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return "not-subscribed";

  const sub = await reg.pushManager.getSubscription();
  return sub ? "subscribed" : "not-subscribed";
}

export async function enablePush(): Promise<PushStatus> {
  if (typeof window === "undefined") return "unsupported";
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";

  const keyInfo = await api<PublicKeyResponse>("/push/public-key");
  if (!keyInfo.enabled || !keyInfo.publicKey) return "disabled-server";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "permission-denied";

  let reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) {
    reg = await navigator.serviceWorker.register("/sw.js");
  }
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyInfo.publicKey),
    });
  }

  const json = sub.toJSON();
  await api("/push/subscribe", {
    method: "POST",
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    }),
  });

  return "subscribed";
}

export async function disablePush(): Promise<PushStatus> {
  if (typeof window === "undefined") return "unsupported";
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return "not-subscribed";

  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    const json = sub.toJSON();
    await api("/push/subscribe", {
      method: "DELETE",
      body: JSON.stringify({ endpoint: json.endpoint }),
    }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
  return "not-subscribed";
}

export async function sendPushTest() {
  return api<{ sent: number }>("/push/test", { method: "POST" });
}
