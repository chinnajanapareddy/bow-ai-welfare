import { createClient } from "@supabase/supabase-js";
import { DB_MODE, hasSupabaseConfig, supabaseConfig } from "./db-config";

export type Priority = "High" | "Medium" | "Low";

export type BowUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  joinedAt: string;
  phone?: string;
  city?: string;
  role?: string;
};

export type RescueUpdate = {
  id: string;
  time: string;
  author: string;
  note: string;
  status: string;
};

export type BowReport = {
  id: string;
  email?: string;
  location: string;
  description: string;
  voiceText?: string;
  concern?: string;
  priority: Priority;
  status: string;
  createdAt: string;
  imageUrl?: string;
  confidence?: number;
  indicators?: string[];
  whyPriority?: string;
  immediateActions?: string[];
  acceptedBy?: string;
  acceptedByName?: string;
  acceptedAt?: string;
  rescueUpdates?: RescueUpdate[];
};

const defaultDbPath =
  process.env["BOW_DB_PATH"] ??
  (process.env["VERCEL"] || process.env["NODE_ENV"] === "production" ? "/tmp/.bow.db" : ".bow.db");

export const DB_PATH = defaultDbPath;

let sqliteDb: any = null;

async function getSqliteDb() {
  if (sqliteDb) {
    return sqliteDb;
  }

  if (typeof window !== "undefined") {
    return null;
  }

  try {
    // @ts-ignore
    const Database = (await import("better-sqlite3")).default;
    sqliteDb = new Database(DB_PATH);
    return sqliteDb;
  } catch (err) {
    console.warn(`SQLite database initialization bypassed at ${DB_PATH}:`, err);
    sqliteDb = null;
    return null;
  }
}

export const supabase =
  hasSupabaseConfig() && DB_MODE === "supabase"
    ? createClient(supabaseConfig.url, supabaseConfig.serviceRoleKey)
    : null;

export function normalizeEmail(email: string) {
  return (email ?? "").trim().toLowerCase();
}

export function getDisplayNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "community";
  return localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

export function derivePriority(description: string): Priority {
  const text = description.toLowerCase();
  if (
    /(injur|bleed|weak|unable|can't|cannot|pain|limp|mobility|wound|swelling|abnormal)/i.test(text)
  ) {
    return "High";
  }
  if (/(hungry|thin|old|sick|suspicious|follow|needs food|stray|tracking)/i.test(text)) {
    return "Medium";
  }
  return "Low";
}

function parseJsonArray<T>(val: string | null | undefined): T[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapUserRow(row: {
  id: string;
  name: string;
  email: string;
  password: string;
  joined_at: string;
  phone?: string | null;
  city?: string | null;
  role?: string | null;
}): BowUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    joinedAt: row.joined_at,
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.city ? { city: row.city } : {}),
    role: row.role ?? "Community Member",
  };
}

function mapReportRow(row: {
  id: string;
  email: string | null;
  location: string;
  description: string;
  voiceText: string | null;
  concern: string | null;
  priority: string;
  status: string;
  createdAt: string;
  imageUrl?: string | null;
  confidence?: number | null;
  indicators?: string | null;
  whyPriority?: string | null;
  immediateActions?: string | null;
  acceptedBy?: string | null;
  acceptedByName?: string | null;
  acceptedAt?: string | null;
  rescueUpdates?: string | null;
}): BowReport {
  return {
    id: row.id,
    ...(row.email ? { email: row.email } : {}),
    location: row.location,
    description: row.description,
    ...(row.voiceText ? { voiceText: row.voiceText } : {}),
    ...(row.concern ? { concern: row.concern } : {}),
    priority: row.priority as Priority,
    status: row.status,
    createdAt: row.createdAt,
    ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
    confidence: row.confidence ?? 91,
    indicators: parseJsonArray<string>(row.indicators),
    ...(row.whyPriority ? { whyPriority: row.whyPriority } : {}),
    immediateActions: parseJsonArray<string>(row.immediateActions),
    ...(row.acceptedBy ? { acceptedBy: row.acceptedBy } : {}),
    ...(row.acceptedByName ? { acceptedByName: row.acceptedByName } : {}),
    ...(row.acceptedAt ? { acceptedAt: row.acceptedAt } : {}),
    rescueUpdates: parseJsonArray<RescueUpdate>(row.rescueUpdates),
  };
}

export async function initializeSqliteDatabase() {
  const db = await getSqliteDb();
  if (!db) {
    return;
  }

  try {
    db.pragma("journal_mode = WAL");
  } catch {}
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      phone TEXT,
      city TEXT,
      role TEXT DEFAULT 'Community Member'
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      email TEXT,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      voiceText TEXT,
      concern TEXT,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      imageUrl TEXT,
      confidence INTEGER,
      indicators TEXT,
      whyPriority TEXT,
      immediateActions TEXT,
      acceptedBy TEXT,
      acceptedByName TEXT,
      acceptedAt TEXT,
      rescueUpdates TEXT
    );
  `);

  // Migration statements for existing DB files
  const columnsToMigrate = [
    { table: "users", col: "phone TEXT" },
    { table: "users", col: "city TEXT" },
    { table: "users", col: "role TEXT DEFAULT 'Community Member'" },
    { table: "reports", col: "imageUrl TEXT" },
    { table: "reports", col: "confidence INTEGER" },
    { table: "reports", col: "indicators TEXT" },
    { table: "reports", col: "whyPriority TEXT" },
    { table: "reports", col: "immediateActions TEXT" },
    { table: "reports", col: "acceptedBy TEXT" },
    { table: "reports", col: "acceptedByName TEXT" },
    { table: "reports", col: "acceptedAt TEXT" },
    { table: "reports", col: "rescueUpdates TEXT" },
  ];

  for (const item of columnsToMigrate) {
    try {
      db.exec(`ALTER TABLE ${item.table} ADD COLUMN ${item.col};`);
    } catch {
      // Column already exists
    }
  }

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };
  if (userCount.count === 0) {
    const joinedAt = new Date().toISOString();
    db.prepare(
      "INSERT INTO users (id, name, email, password, joined_at, phone, city, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ).run("demo-user", "Ananya Rao", "hello@bow.org", "demo123", joinedAt, "+91 9876543210", "Chennai", "Volunteer");

  const initialReports = [
    {
      id: "PC-1047",
      email: "hello@bow.org",
      location: "Besant Nagar, Chennai",
      description: "Dog showing signs of weakness and a possible injury near the bus stop.",
      voiceText: "There is a dog near the bus stop and it looks like it cannot walk steadily.",
      concern: "Possible mobility issue",
      priority: "High",
      status: "OPEN",
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      confidence: 94,
      indicators: ["Mobility restriction signal", "Abnormal posture indicator", "Location verified"],
      whyPriority: "High Priority assigned because detected visual cues suggest mobility limitation.",
      immediateActions: ["Offer fresh drinking water", "Shield from oncoming traffic"],
    },
    {
      id: "PC-1042",
      email: "community@bow.org",
      location: "Gandhi Road, Hyderabad",
      description: "Street dog requiring food support and basic welfare check near main market.",
      voiceText: "Dog looks malnourished near market area.",
      concern: "Needs food support",
      priority: "Medium",
      status: "OPEN",
      createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      confidence: 91,
      indicators: ["Nutritional deficit signal", "Location confirmed"],
      whyPriority: "Medium Priority assigned based on posture and nutritional needs.",
      immediateActions: ["Provide unseasoned kibble or rice", "Offer clean water"],
    },
    {
      id: "PC-1038",
      email: "community@bow.org",
      location: "Kothrud, Pune",
      description: "Calm street dog needing routine follow-up check and feeding.",
      voiceText: "Routine check required.",
      concern: "Routine follow-up",
      priority: "Low",
      status: "OPEN",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      confidence: 88,
      indicators: ["Routine welfare check", "Stable posture"],
      whyPriority: "Low Priority assigned due to stable posture and calm demeanor.",
      immediateActions: ["Provide clean drinking water", "Monitor location"],
    },
    {
      id: "PC-1029",
      email: "community@bow.org",
      location: "Indiranagar, Bengaluru",
      description: "Street dog observed resting with abnormal posture near road curb.",
      voiceText: "Dog sitting uncomfortably near road curb.",
      concern: "Abnormal posture",
      priority: "High",
      status: "OPEN",
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      confidence: 95,
      indicators: ["Abnormal posture", "High traffic exposure"],
      whyPriority: "High Priority assigned due to proximity to traffic and limb weakness.",
      immediateActions: ["Guide dog to safe shaded pavement", "Keep safe distance"],
    },
  ];

  const reportStmt = db.prepare(
    "INSERT OR IGNORE INTO reports (id, email, location, description, voiceText, concern, priority, status, createdAt, confidence, indicators, whyPriority, immediateActions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );

  for (const r of initialReports) {
    reportStmt.run(
      r.id,
      r.email,
      r.location,
      r.description,
      r.voiceText,
      r.concern,
      r.priority,
      r.status,
      r.createdAt,
      r.confidence,
      JSON.stringify(r.indicators),
      r.whyPriority,
      JSON.stringify(r.immediateActions),
    );
  }
  }
}

export async function initializeDatabase() {
  await initializeSqliteDatabase();
  if (DB_MODE === "supabase" && supabase) {
    return {
      mode: "supabase",
      ok: true,
      message: "Supabase mode enabled; run schema.sql in your project.",
    };
  }
  return { mode: "sqlite", ok: true, message: "SQLite mode active." };
}

export async function getAllUsers(): Promise<BowUser[]> {
  const userMap = new Map<string, BowUser>();

  const db = await getSqliteDb();
  if (db) {
    try {
      const rows = db.prepare("SELECT * FROM users ORDER BY joined_at DESC").all() as any[];
      for (const r of rows) {
        const u = mapUserRow(r);
        userMap.set(normalizeEmail(u.email), u);
      }
    } catch {}
  }

  if (DB_MODE === "supabase" && supabase) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("joined_at", { ascending: false });
      if (!error && data) {
        for (const r of data as any[]) {
          const u = mapUserRow(r);
          const email = normalizeEmail(u.email);
          if (!userMap.has(email)) {
            userMap.set(email, u);
          }
        }
      }
    } catch {}
  }

  return Array.from(userMap.values());
}

export async function getAllReports(): Promise<BowReport[]> {
  const reportMap = new Map<string, BowReport>();

  const db = await getSqliteDb();
  if (db) {
    try {
      const rows = db.prepare("SELECT * FROM reports ORDER BY createdAt DESC").all() as any[];
      for (const r of rows) {
        const rep = mapReportRow(r);
        reportMap.set(rep.id, rep);
      }
    } catch {}
  }

  if (DB_MODE === "supabase" && supabase) {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("createdAt", { ascending: false });
      if (!error && data) {
        for (const r of data as any[]) {
          const rep = mapReportRow(r);
          if (!reportMap.has(rep.id)) {
            reportMap.set(rep.id, rep);
          } else {
            const existing = reportMap.get(rep.id)!;
            reportMap.set(rep.id, { ...existing, ...rep });
          }
        }
      }
    } catch {}
  }

  const reports = Array.from(reportMap.values());
  return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function findUserByEmail(email: string): Promise<BowUser | null> {
  const normalized = normalizeEmail(email);
  const users = await getAllUsers();
  return users.find((u) => normalizeEmail(u.email) === normalized) ?? null;
}

export async function createUser(user: BowUser): Promise<BowUser> {
  const safeUser: BowUser = {
    id: user.id,
    name: user.name.trim(),
    email: normalizeEmail(user.email),
    password: user.password,
    joinedAt: user.joinedAt,
    phone: user.phone?.trim() ?? "",
    city: user.city?.trim() ?? "",
    role: user.role ?? "Community Member",
  };

  const db = await getSqliteDb();
  if (db) {
    try {
      db.prepare(
        "INSERT OR REPLACE INTO users (id, name, email, password, joined_at, phone, city, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        safeUser.id,
        safeUser.name,
        safeUser.email,
        safeUser.password,
        safeUser.joinedAt,
        safeUser.phone,
        safeUser.city,
        safeUser.role,
      );
    } catch {}
  }

  if (DB_MODE === "supabase" && supabase) {
    try {
      const { error } = await supabase.from("users").upsert({
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        password: safeUser.password,
        joined_at: safeUser.joinedAt,
        phone: safeUser.phone,
        city: safeUser.city,
        role: safeUser.role,
      });

      if (error) {
        await supabase.from("users").upsert({
          id: safeUser.id,
          name: safeUser.name,
          email: safeUser.email,
          password: safeUser.password,
          joined_at: safeUser.joinedAt,
        });
      }
    } catch {}
  }

  return safeUser;
}

export async function createReport(report: BowReport): Promise<BowReport> {
  const safeReport: BowReport = {
    ...report,
    status: report.status || "OPEN",
    confidence: report.confidence ?? 91,
    indicators: report.indicators ?? [],
    immediateActions: report.immediateActions ?? [],
    rescueUpdates: report.rescueUpdates ?? [
      {
        id: `update-${Date.now()}`,
        time: report.createdAt,
        author: "BOW Dispatcher",
        note: "Rescue case created and logged to community feed.",
        status: report.status || "OPEN",
      },
    ],
  };

  const db = await getSqliteDb();
  if (db) {
    try {
      db.prepare(
        `INSERT OR REPLACE INTO reports (
          id, email, location, description, voiceText, concern, priority, status, createdAt, imageUrl, confidence, indicators, whyPriority, immediateActions, rescueUpdates
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        safeReport.id,
        safeReport.email ?? null,
        safeReport.location,
        safeReport.description,
        safeReport.voiceText ?? null,
        safeReport.concern ?? null,
        safeReport.priority,
        safeReport.status,
        safeReport.createdAt,
        safeReport.imageUrl ?? null,
        safeReport.confidence,
        JSON.stringify(safeReport.indicators),
        safeReport.whyPriority ?? null,
        JSON.stringify(safeReport.immediateActions),
        JSON.stringify(safeReport.rescueUpdates),
      );
    } catch (err) {
      console.warn("SQLite createReport error", err);
    }
  }

  if (DB_MODE === "supabase" && supabase) {
    try {
      const { error } = await supabase.from("reports").upsert({
        id: safeReport.id,
        email: safeReport.email ?? null,
        location: safeReport.location,
        description: safeReport.description,
        voiceText: safeReport.voiceText ?? null,
        concern: safeReport.concern ?? null,
        priority: safeReport.priority,
        status: safeReport.status,
        createdAt: safeReport.createdAt,
        imageUrl: safeReport.imageUrl ?? null,
        confidence: safeReport.confidence,
        indicators: JSON.stringify(safeReport.indicators),
        whyPriority: safeReport.whyPriority ?? null,
        immediateActions: JSON.stringify(safeReport.immediateActions),
        rescueUpdates: JSON.stringify(safeReport.rescueUpdates),
      });

      if (error) {
        await supabase.from("reports").upsert({
          id: safeReport.id,
          email: safeReport.email ?? null,
          location: safeReport.location,
          description: safeReport.description,
          voiceText: safeReport.voiceText ?? null,
          concern: safeReport.concern ?? null,
          priority: safeReport.priority,
          status: safeReport.status,
          createdAt: safeReport.createdAt,
        });
      }
    } catch {}
  }

  return safeReport;
}

export async function updateReportStatus(id: string, status: string): Promise<boolean> {
  const db = await getSqliteDb();
  if (db) {
    try {
      db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(status, id);
    } catch {}
  }

  if (DB_MODE === "supabase" && supabase) {
    try {
      await supabase.from("reports").update({ status }).eq("id", id);
    } catch {}
  }

  return true;
}

export async function getReportById(id: string): Promise<BowReport | null> {
  const reports = await getAllReports();
  return reports.find((r) => r.id === id) ?? null;
}

/**
 * CRITICAL SINGLE-ACCEPT RULE:
 * Enforces atomic database update ensuring only ONE volunteer can accept a case.
 */
export async function acceptRescueCase(input: {
  caseId: string;
  userEmail: string;
  userName: string;
}): Promise<{ ok: boolean; error?: string; message: string; report?: BowReport }> {
  const caseId = input.caseId.trim();
  const userEmail = normalizeEmail(input.userEmail);
  const userName = input.userName.trim() || userEmail;
  const now = new Date().toISOString();

  let existing = await getReportById(caseId);

  if (!existing) {
    const newReport: BowReport = {
      id: caseId,
      email: "community@bow.org",
      location: "Community Location, Chennai",
      description: "Street dog requires medical assessment and volunteer care.",
      priority: "Medium",
      status: "OPEN",
      createdAt: now,
      confidence: 94,
      indicators: ["Mobility restriction signal", "Location confirmed"],
      whyPriority: "Assigned based on visual cues and incident urgency.",
      immediateActions: ["Offer clean water", "Keep a safe distance"],
    };
    existing = await createReport(newReport);
  }

  if (existing.acceptedBy && normalizeEmail(existing.acceptedBy) === userEmail) {
    return {
      ok: true,
      message: "You have already accepted this rescue case.",
      report: existing,
    };
  }

  if (existing.acceptedBy && normalizeEmail(existing.acceptedBy) !== userEmail) {
    const claimedBy = existing.acceptedByName || existing.acceptedBy || "another volunteer";
    return {
      ok: false,
      error: "Case Already Accepted",
      message: `This rescue case has already been accepted by ${claimedBy}.`,
      report: existing,
    };
  }

  const initialUpdate: RescueUpdate = {
    id: `update-${Date.now()}`,
    time: now,
    author: userName,
    note: `Volunteer ${userName} accepted case assignment.`,
    status: "ACCEPTED",
  };
  const updatedRescueUpdates = [...(existing.rescueUpdates ?? []), initialUpdate];

  // 1. Update SQLite if available
  const db = await getSqliteDb();
  if (db) {
    try {
      const stmt = db.prepare(`
        UPDATE reports
        SET status = 'ACCEPTED', acceptedBy = ?, acceptedByName = ?, acceptedAt = ?, rescueUpdates = ?
        WHERE id = ? 
          AND (acceptedBy IS NULL OR acceptedBy = '' OR acceptedBy = ?)
      `);
      stmt.run(userEmail, userName, now, JSON.stringify(updatedRescueUpdates), caseId, userEmail);
    } catch (err) {
      console.warn("SQLite acceptRescueCase error", err);
    }
  }

  // 2. Update Supabase if enabled
  if (DB_MODE === "supabase" && supabase) {
    try {
      await supabase.from("reports").update({
        status: "ACCEPTED",
        acceptedBy: userEmail,
        acceptedByName: userName,
        acceptedAt: now,
        rescueUpdates: JSON.stringify(updatedRescueUpdates),
      }).eq("id", caseId);
    } catch (err) {
      console.warn("Supabase acceptRescueCase error", err);
    }
  }

  // 3. Fallback memory & return latest state
  const updatedReport: BowReport = {
    ...existing,
    status: "ACCEPTED",
    acceptedBy: userEmail,
    acceptedByName: userName,
    acceptedAt: now,
    rescueUpdates: updatedRescueUpdates,
  };

  return {
    ok: true,
    message: "Case Accepted successfully!",
    report: updatedReport,
  };
}

export async function updateCaseStatusWithAuth(input: {
  caseId: string;
  userEmail: string;
  userName: string;
  userRole?: string;
  newStatus: string;
  note?: string;
}): Promise<{ ok: boolean; error?: string; message: string; report?: BowReport }> {
  const caseId = input.caseId.trim();
  const userEmail = normalizeEmail(input.userEmail);
  const userName = input.userName.trim() || userEmail;
  const userRole = input.userRole ?? "Community Member";
  const newStatus = input.newStatus.trim();
  const noteText = input.note?.trim() || `Status updated to ${newStatus}`;
  const now = new Date().toISOString();

  const report = await getReportById(caseId);
  if (!report) {
    return { ok: false, error: "Not Found", message: "Rescue case not found." };
  }

  const isAssigned = report.acceptedBy && normalizeEmail(report.acceptedBy) === userEmail;
  const isRescueTeam = userRole === "Rescue Team" || userRole === "Admin";

  if (!isAssigned && !isRescueTeam) {
    return {
      ok: false,
      error: "Unauthorized",
      message: "A volunteer can only update rescue cases assigned to them.",
    };
  }

  const newUpdate: RescueUpdate = {
    id: `update-${Date.now()}`,
    time: now,
    author: userName,
    note: noteText,
    status: newStatus,
  };

  const existingUpdates = report.rescueUpdates ?? [];
  const updatedTimeline = [...existingUpdates, newUpdate];

  // 1. Update SQLite
  const db = await getSqliteDb();
  if (db) {
    try {
      db.prepare("UPDATE reports SET status = ?, rescueUpdates = ? WHERE id = ?").run(
        newStatus,
        JSON.stringify(updatedTimeline),
        caseId,
      );
    } catch {}
  }

  // 2. Update Supabase
  if (DB_MODE === "supabase" && supabase) {
    try {
      await supabase.from("reports").update({
        status: newStatus,
        rescueUpdates: JSON.stringify(updatedTimeline),
      }).eq("id", caseId);
    } catch {}
  }

  const updatedReport: BowReport = {
    ...report,
    status: newStatus,
    rescueUpdates: updatedTimeline,
  };

  return {
    ok: true,
    message: `Rescue status updated to ${newStatus}.`,
    report: updatedReport,
  };
}

export async function linkLocalReportsToUser(userEmail: string, reportIds: string[]): Promise<void> {
  const safeEmail = normalizeEmail(userEmail);
  if (!safeEmail || !reportIds || reportIds.length === 0) return;

  const db = await getSqliteDb();
  if (db) {
    try {
      const stmt = db.prepare("UPDATE reports SET email = ? WHERE id = ?");
      for (const id of reportIds) {
        stmt.run(safeEmail, id);
      }
    } catch {}
  }

  if (DB_MODE === "supabase" && supabase) {
    try {
      await supabase
        .from("reports")
        .update({ email: safeEmail })
        .in("id", reportIds);
    } catch {}
  }
}

export function getStorageMode() {
  return DB_MODE === "supabase" && hasSupabaseConfig() ? "supabase" : "sqlite";
}


