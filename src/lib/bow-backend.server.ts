import { createServerFn } from "@tanstack/react-start";
import {
  acceptRescueCase,
  createReport,
  createUser,
  derivePriority,
  findUserByEmail,
  getAllReports,
  getDisplayNameFromEmail,
  getLiveSystemStats,
  getReportById,
  getStorageMode,
  initializeDatabase,
  linkLocalReportsToUser,
  normalizeEmail,
  updateCaseStatusWithAuth,
  updateReportStatus,
  type BowReport,
  type BowUser,
  type RescueUpdate,
} from "./bow-database.server";
import {
  analyzeDogReport,
  askBowAi,
  matchAdoptionDogs,
  analyzeFoodDonation,
  generateDogDescription,
} from "./bow-ai.server";

export type Priority = "High" | "Medium" | "Low";
export type { BowUser, BowReport, RescueUpdate };

export type BowState = {
  users: BowUser[];
  reports: BowReport[];
};

function getProfilePayload(user: BowUser, reports: BowReport[], localReportIds: string[] = []) {
  const safeUserEmail = normalizeEmail(user.email);
  const userReports = reports.filter((report) => {
    const reportEmail = normalizeEmail(report.email ?? "");
    const matchesEmail = Boolean(reportEmail && reportEmail === safeUserEmail);
    const matchesLocalId = localReportIds.includes(report.id);
    return matchesEmail || matchesLocalId;
  });
  const assignedCases = reports.filter(
    (report) => report.acceptedBy && normalizeEmail(report.acceptedBy) === safeUserEmail,
  );

  const supportedStories =
    userReports.length > 0 ? Math.max(1, Math.min(24, userReports.length * 2)) : 0;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    city: user.city ?? "",
    role: user.role ?? "Community Member",
    joinedAt: user.joinedAt,
    userReports,
    assignedCases,
    impact: [
      { value: String(Math.max(1, userReports.length)), label: "reports submitted" },
      { value: String(assignedCases.length), label: "rescue cases claimed" },
      { value: String(Math.max(1, Math.min(20, supportedStories))), label: "stories supported" },
    ],
    badges: [
      {
        title: user.role === "Volunteer" ? "Active Volunteer" : "Community Helper",
        text: `${userReports.length || 1} reports reviewed`,
        icon: "shield",
      },
      {
        title: "Street Soul Supporter",
        text: `${supportedStories || 1} stories supported`,
        icon: "heart",
      },
      {
        title: "Feeding Champion",
        text: `${Math.max(1, Math.min(5, userReports.length + 1))} drives completed`,
        icon: "utensils",
      },
    ],
  };
}

initializeDatabase();

export async function getHealth() {
  return { ok: true, timestamp: new Date().toISOString(), mode: getStorageMode() };
}

export async function signupUser(input: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  password: string;
  role?: string;
}) {
  const safeEmail = normalizeEmail(input.email);
  const trimmedName = input.name.trim();
  const password = input.password;

  if (!safeEmail || !trimmedName || !password) {
    return { ok: false, message: "Full Name, Email, and Password are required." };
  }

  const existing = await findUserByEmail(safeEmail);
  if (existing) {
    return { ok: false, message: "An account with this email already exists. Please log in." };
  }

  const newUser: BowUser = {
    id: `user-${Date.now()}`,
    name: trimmedName,
    email: safeEmail,
    password,
    phone: input.phone?.trim() ?? "",
    city: input.city?.trim() ?? "",
    role: input.role ?? "Community Member",
    joinedAt: new Date().toISOString(),
  };

  await createUser(newUser);
  const profile = getProfilePayload(newUser, await getAllReports());

  return {
    ok: true,
    user: newUser,
    profile,
    message: "Welcome to BOW! Your community account has been created.",
  };
}

export async function loginUser(email: string, password: string) {
  const safeEmail = normalizeEmail(email);
  if (!safeEmail || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  const existingUser = await findUserByEmail(safeEmail);
  if (existingUser) {
    if (existingUser.password !== password) {
      return { ok: false, message: "Incorrect password. Please try again." };
    }

    const profile = getProfilePayload(existingUser, await getAllReports());
    return { ok: true, created: false, user: existingUser, profile };
  }

  const newUser: BowUser = {
    id: `user-${Date.now()}`,
    name: getDisplayNameFromEmail(safeEmail),
    email: safeEmail,
    password,
    joinedAt: new Date().toISOString(),
    role: "Community Member",
  };

  await createUser(newUser);
  const profile = getProfilePayload(newUser, await getAllReports());

  return {
    ok: true,
    created: true,
    user: newUser,
    profile,
  };
}

export async function getProfile(email: string, localReportIds: string[] = []) {
  const safeEmail = normalizeEmail(email);

  if (localReportIds.length > 0 && safeEmail) {
    await linkLocalReportsToUser(safeEmail, localReportIds);
  }

  const user = await findUserByEmail(safeEmail);
  const allReports = await getAllReports();

  if (!user) {
    const fallbackUser: BowUser = {
      id: `guest-${Date.now()}`,
      name: getDisplayNameFromEmail(safeEmail) || "Community Member",
      email: safeEmail || "hello@bow.org",
      password: "",
      joinedAt: new Date().toISOString(),
      role: "Community Member",
    };
    return {
      ok: true,
      profile: getProfilePayload(fallbackUser, allReports, localReportIds),
    };
  }

  return {
    ok: true,
    profile: getProfilePayload(user, allReports, localReportIds),
  };
}

export async function submitReport(input: {
  email?: string;
  location?: string;
  description?: string;
  voiceText?: string;
  concern?: string;
  imageDataUrl?: string;
  imageUrl?: string;
  imagePreview?: string;
}) {
  const userPhoto = (input.imageDataUrl || input.imageUrl || input.imagePreview || "").trim();
  const payload = {
    email: normalizeEmail(input.email ?? "hello@bow.org"),
    location: (input.location ?? "Location Not Provided").trim() || "Location Not Provided",
    description:
      (input.description ?? "Street dog appears to need support.").trim() ||
      "Street dog appears to need support.",
    voiceText: (input.voiceText ?? "").trim(),
    concern: (input.concern ?? "Possible mobility issue").trim() || "Possible mobility issue",
    imageDataUrl: userPhoto,
  };

  const insight = await analyzeDogReport(payload);
  const reportId = `PC-${Date.now()}`;
  const defaultDogPhotos = [
    "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1655108624627-2802306434d8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1632090841068-41088be12ce9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1659292692984-4787c010746f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1633512227626-a1f547fc6de3?auto=format&fit=crop&q=80&w=800",
  ];
  const charSum = reportId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const chosenPhoto =
    userPhoto.length > 10
      ? userPhoto
      : defaultDogPhotos[Math.abs(charSum) % defaultDogPhotos.length];

  const report: BowReport = {
    id: reportId,
    email: payload.email,
    location: payload.location,
    description: payload.description,
    voiceText: payload.voiceText || payload.description,
    concern: payload.concern,
    priority: insight.priority,
    status: "OPEN",
    createdAt: new Date().toISOString(),
    imageUrl: chosenPhoto,
    confidence: insight.confidence ?? 92,
    indicators: insight.indicators ?? ["Visible physical assessment", "Location logged"],
    whyPriority: insight.whyPriority ?? "Assigned based on visual cues and incident urgency.",
    immediateActions: insight.immediateActions ?? ["Provide clean water", "Shield from traffic"],
  };

  const savedReport = await createReport(report);

  return {
    ok: true,
    report: savedReport,
    ai: {
      priority: insight.priority,
      summary: insight.summary,
      recommendedAction: insight.recommendedAction,
      confidence: insight.confidence,
      indicators: insight.indicators,
      whyPriority: insight.whyPriority,
      immediateActions: insight.immediateActions,
    },
    message: "Report received. A rescue case has been created.",
  };
}

export async function getReports() {
  const reports = await getAllReports();
  return { ok: true, reports: reports.slice(0, 50), mode: getStorageMode() };
}

export const signupServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name: string;
      email: string;
      phone?: string;
      city?: string;
      password: string;
      role?: string;
    }) => ({
      name: String(data?.name ?? "").trim(),
      email: String(data?.email ?? "").trim(),
      phone: String(data?.phone ?? "").trim(),
      city: String(data?.city ?? "").trim(),
      password: String(data?.password ?? ""),
      role: String(data?.role ?? "Community Member").trim(),
    }),
  )
  .handler(async ({ data }) => signupUser(data));

export const loginServerFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => {
    if (!data?.email || !data?.password) {
      throw new Error("Email and password are required.");
    }
    return {
      email: String(data.email).trim(),
      password: String(data.password),
    };
  })
  .handler(async ({ data }) => loginUser(data.email, data.password));

export const getProfileServerFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; localReportIds?: string[] }) => ({
    email: String(data?.email ?? "").trim(),
    localReportIds: Array.isArray(data?.localReportIds) ? data.localReportIds.map(String) : [],
  }))
  .handler(async ({ data }) => getProfile(data.email, data.localReportIds));


export const submitReportServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: any) => {
      const payload = data?.data ?? data;
      return {
        email: String(payload?.email ?? "").trim(),
        location: String(payload?.location ?? "").trim(),
        description: String(payload?.description ?? "").trim(),
        voiceText: String(payload?.voiceText ?? "").trim(),
        concern: String(payload?.concern ?? "").trim(),
        imageDataUrl: String(payload?.imageDataUrl ?? "").trim(),
      };
    },
  )
  .handler(async ({ data }) => submitReport(data));

export const getReportsServerFn = createServerFn({ method: "GET" }).handler(async () =>
  getReports(),
);

export const askBowAiServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: any) => {
      const payload = data?.data ?? data;
      return {
        question: String(payload?.question ?? "").trim(),
        cases: Array.isArray(payload?.cases) ? payload.cases : [],
      };
    },
  )
  .handler(async ({ data }) => askBowAi({ question: data.question, cases: data.cases }));

export const matchAdoptionDogsServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: any) => {
      const payload = data?.data ?? data;
      return {
        homeType: String(payload?.homeType ?? "").trim(),
        familySize: String(payload?.familySize ?? "").trim(),
        timeAvailable: String(payload?.timeAvailable ?? "").trim(),
        activityLevel: String(payload?.activityLevel ?? "").trim(),
        preferredSize: String(payload?.preferredSize ?? "").trim(),
        petExperience: String(payload?.petExperience ?? "").trim(),
      };
    },
  )
  .handler(async ({ data }) => matchAdoptionDogs(data));

export const analyzeFoodDonationServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: any) => {
      const payload = data?.data ?? data;
      return {
        foodType: String(payload?.foodType ?? "").trim(),
        quantity: String(payload?.quantity ?? "").trim(),
        location: String(payload?.location ?? "").trim(),
      };
    },
  )
  .handler(async ({ data }) => analyzeFoodDonation(data));

export const generateDogDescriptionServerFn = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const payload = data?.data ?? data;
    return {
      imageDataUrl: String(payload?.imageDataUrl ?? "").trim(),
      voiceText: String(payload?.voiceText ?? "").trim(),
    };
  })
  .handler(async ({ data }) => generateDogDescription(data));

export const updateReportStatusServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string; status: string }) => ({
    id: String(data?.id ?? "").trim(),
    status: String(data?.status ?? "").trim(),
  }))
  .handler(async ({ data }) => {
    const success = await updateReportStatus(data.id, data.status);
    return { ok: success };
  });

export const getReportByIdServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({
    id: String(data?.id ?? "").trim(),
  }))
  .handler(async ({ data }) => {
    const report = await getReportById(data.id);
    return { ok: Boolean(report), report };
  });

export const acceptCaseServerFn = createServerFn({ method: "POST" })
  .validator((data: { caseId: string; userEmail: string; userName: string }) => ({
    caseId: String(data?.caseId ?? "").trim(),
    userEmail: String(data?.userEmail ?? "").trim(),
    userName: String(data?.userName ?? "").trim(),
  }))
  .handler(async ({ data }) => acceptRescueCase(data));

export const updateCaseStatusServerFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      caseId: string;
      userEmail: string;
      userName: string;
      userRole?: string;
      newStatus: string;
      note?: string;
    }) => ({
      caseId: String(data?.caseId ?? "").trim(),
      userEmail: String(data?.userEmail ?? "").trim(),
      userName: String(data?.userName ?? "").trim(),
      userRole: String(data?.userRole ?? "Community Member").trim(),
      newStatus: String(data?.newStatus ?? "").trim(),
      note: String(data?.note ?? "").trim(),
    }),
  )
  .handler(async ({ data }) => updateCaseStatusWithAuth(data));

export const getSystemStatsServerFn = createServerFn({ method: "GET" }).handler(async () =>
  getLiveSystemStats(),
);

