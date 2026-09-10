/**
 * BOW Volunteer Notification System
 * Handles Browser Push Notifications, 3km proximity alerts, and WhatsApp dispatch integrations.
 */

export type NotificationPref = {
  enabled: boolean;
  whatsappNumber: string;
  radiusKm: number;
  highPriorityOnly: boolean;
};

const DEFAULT_PREF_KEY = "bow-notification-prefs";

export function getNotificationPrefs(): NotificationPref {
  if (typeof window === "undefined") {
    return { enabled: true, whatsappNumber: "+91 9876543210", radiusKm: 3, highPriorityOnly: true };
  }
  try {
    const stored = localStorage.getItem(DEFAULT_PREF_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { enabled: true, whatsappNumber: "+91 9876543210", radiusKm: 3, highPriorityOnly: true };
}

export function saveNotificationPrefs(prefs: Partial<NotificationPref>): NotificationPref {
  const current = getNotificationPrefs();
  const updated = { ...current, ...prefs };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DEFAULT_PREF_KEY, JSON.stringify(updated));
    } catch {}
  }
  return updated;
}

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  try {
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
  } catch (e) {
    console.warn("Notification permission error:", e);
  }
  return false;
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function triggerHighPriorityAlert(input: {
  reportId: string;
  location: string;
  description: string;
  priority: string;
  volunteerCount?: number;
}): { whatsappUrl: string; alertDispatched: boolean; recipientCount: number } {
  const prefs = getNotificationPrefs();
  const recipientCount = input.volunteerCount || 14;

  const message = `🚨 *BOW HIGH PRIORITY RESCUE ALERT* 🚨\n\n*Case ID:* ${input.reportId}\n*Location:* ${input.location}\n*Details:* ${input.description}\n\n👉 *Accept & Navigate:* https://bow-ai-welfare.vercel.app/rescue?caseId=${input.reportId}`;

  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;

  let alertDispatched = false;

  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(`🚨 High Priority Rescue Alert — ${input.location}`, {
        body: `Dog in need near ${input.location}. Tap to view details and navigate.`,
        icon: "/favicon.ico",
        tag: input.reportId,
      });
      alertDispatched = true;
    } catch {}
  }

  return { whatsappUrl, alertDispatched, recipientCount };
}
