import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function saveReportPhoto(reportId: string, photoDataUrl: string) {
  if (typeof window === "undefined" || !reportId || !photoDataUrl) return;
  try {
    const photoVal = window.localStorage.getItem("bow-user-report-photos");
    const photoMap = photoVal ? JSON.parse(photoVal) : {};
    if (photoDataUrl.length > 20) {
      photoMap[reportId] = photoDataUrl;
      window.localStorage.setItem("bow-user-report-photos", JSON.stringify(photoMap));
    }
  } catch {}
}

export function getReportPhoto(reportId?: string, serverImageUrl?: string): string {
  if (typeof window !== "undefined" && reportId) {
    try {
      const photoVal = window.localStorage.getItem("bow-user-report-photos");
      if (photoVal) {
        const photoMap = JSON.parse(photoVal);
        if (photoMap[reportId] && photoMap[reportId].length > 20) {
          return photoMap[reportId];
        }
      }
    } catch {}
  }
  if (serverImageUrl && serverImageUrl.trim().length > 20) {
    return serverImageUrl;
  }
  return "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800";
}
