import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { BowCard, PageIntro, PriorityBadge, SectionHeading } from "@/components/bow-ui";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Utensils,
} from "@/components/bow-icons";
import { getProfileServerFn, type BowReport } from "@/lib/bow-backend.server";
import { getReportPhoto } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Reported Dogs & Profile — BOW" },
      {
        name: "description",
        content: "Track your reported street souls, view real-time rescue status updates, and view your community impact.",
      },
      { property: "og:title", content: "Your Reported Dogs & Profile — BOW" },
      { property: "og:description", content: "Your actions help make brighter tomorrows for street dogs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

type ProfileData = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role?: string;
  joinedAt: string;
  userReports?: BowReport[];
  assignedCases?: BowReport[];
  impact: Array<{ value: string; label: string }>;
  badges: Array<{ title: string; text: string; icon: string }>;
};

function getTimeAgo(dateString?: string) {
  if (!dateString) return "Recently";
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "Recently";
  }
}

function Profile() {
  const getProfile = useServerFn(getProfileServerFn);
  const [profile, setProfile] = useState<ProfileData>({
    name: "Community Member",
    email: "hello@bow.org",
    phone: "",
    city: "",
    role: "Community Member",
    joinedAt: new Date().toISOString(),
    userReports: [],
    assignedCases: [],
    impact: [
      { value: "0", label: "reports submitted" },
      { value: "0", label: "rescue cases claimed" },
      { value: "0", label: "stories supported" },
    ],
    badges: [
      { title: "Active Reporter", text: "Reported street dog welfare", icon: "shield" },
      { title: "Street Soul Supporter", text: "Connecting dogs with rescue", icon: "heart" },
      { title: "Community Champion", text: "Active local volunteer", icon: "utensils" },
    ],
  });

  const [reportFilter, setReportFilter] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");

  useEffect(() => {
    const email =
      window.localStorage.getItem("bow-user-email") ||
      window.sessionStorage.getItem("bow-user-email") ||
      "hello@bow.org";
    const name = window.localStorage.getItem("bow-user-name") || window.sessionStorage.getItem("bow-user-name");
    const role = window.localStorage.getItem("bow-user-role") || window.sessionStorage.getItem("bow-user-role");

    let localReportIds: string[] = [];
    try {
      const stored = window.localStorage.getItem("bow-user-report-ids");
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        localReportIds = parsed.map(String);
      }
    } catch {}

    void (async () => {
      try {
        const result = await getProfile({ data: { email, localReportIds } });
        if (result.ok && result.profile) {
          setProfile((prev) => ({
            ...prev,
            ...(result.profile as ProfileData),
            name: name || (result.profile as any).name || prev.name,
            role: role || (result.profile as any).role || prev.role,
          }));
        }
      } catch (err) {
        console.warn("Failed to load user profile", err);
      }
    })();
  }, [getProfile]);


  const badgeMap = {
    shield: ShieldCheck,
    heart: Heart,
    utensils: Utensils,
  } as const;

  const userReports = profile.userReports ?? [];
  const assignedCases = profile.assignedCases ?? [];

  const filteredReports = useMemo(() => {
    if (reportFilter === "ACTIVE") {
      return userReports.filter((r) =>
        ["OPEN", "ACCEPTED", "RESCUE_IN_PROGRESS", "Sent to rescue team", "Reviewed"].includes(
          r.status ?? "OPEN",
        ),
      );
    }
    if (reportFilter === "RESOLVED") {
      return userReports.filter((r) =>
        ["RESOLVED", "HELP_PROVIDED", "Rescued Successfully"].includes(r.status ?? ""),
      );
    }
    return userReports;
  }, [userReports, reportFilter]);

  const activeReportCount = userReports.filter((r) =>
    ["OPEN", "ACCEPTED", "RESCUE_IN_PROGRESS", "Sent to rescue team", "Reviewed"].includes(
      r.status ?? "OPEN",
    ),
  ).length;

  const resolvedReportCount = userReports.filter((r) =>
    ["RESOLVED", "HELP_PROVIDED", "Rescued Successfully"].includes(r.status ?? ""),
  ).length;

  return (
    <main>
      <PageIntro
        eyebrow="Community Profile & Reported History"
        title="Your actions bring help to street souls."
        body="View all dogs you've reported, track live rescue team progress, and check your volunteer credentials."
      />

      <section className="px-5 py-10 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* User Details & Credentials Header */}
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <BowCard className="p-7 space-y-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-bow-sand text-bow-brown shrink-0 shadow-2xs">
                  <PawPrint className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="font-display text-3xl">{profile.name}</h2>
                  <span className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bow-forest text-primary-foreground">
                    <UserCheck className="h-3 w-3" /> {profile.role ?? "Community Member"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground border-t border-border pt-4">
                <p><strong>Email:</strong> {profile.email}</p>
                {profile.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
                {profile.city && <p><strong>City:</strong> {profile.city}</p>}
                <p>
                  <strong>Member since:</strong>{" "}
                  {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </p>
              </div>

              <div className="border-t border-border pt-5">
                <p className="eyebrow">Your BOW Impact</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-bow-sand/50 p-2.5 border border-border">
                    <span className="block font-display text-2xl text-bow-forest">{userReports.length}</span>
                    <span className="text-[0.65rem] font-semibold text-muted-foreground uppercase">Reported</span>
                  </div>
                  <div className="rounded-lg bg-blue-50/70 p-2.5 border border-blue-200">
                    <span className="block font-display text-2xl text-blue-700">{activeReportCount}</span>
                    <span className="text-[0.65rem] font-semibold text-blue-900 uppercase">In Rescue</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50/70 p-2.5 border border-emerald-200">
                    <span className="block font-display text-2xl text-emerald-700">{resolvedReportCount}</span>
                    <span className="text-[0.65rem] font-semibold text-emerald-900 uppercase">Rescued</span>
                  </div>
                </div>
              </div>
            </BowCard>

            <div>
              <SectionHeading
                eyebrow="Verified Badges & Leaderboard"
                title="Community Standing & Achievements"
                action={
                  <Button asChild className="bg-bow-brown hover:bg-bow-brown/90 text-white text-xs font-semibold">
                    <Link to="/leaderboard">View Leaderboard & Ranks 🏆</Link>
                  </Button>
                }
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {profile.badges.map(({ title, text, icon }) => {
                  const Icon = badgeMap[icon as keyof typeof badgeMap] ?? ShieldCheck;
                  return (
                    <BowCard key={title} className="p-5">
                      <Icon className="h-5 w-5 text-bow-brown" />
                      <h3 className="mt-6 font-display text-xl">{title}</h3>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{text}</p>
                      <div className="mt-4 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-bow-forest">
                        <BadgeCheck className="h-4 w-4 text-emerald-600" /> Verified
                      </div>
                    </BowCard>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MAIN SECTION: REPORTED DOGS & LIVE RESCUE STATUS HISTORY */}
          <div className="pt-8 border-t border-border space-y-6" id="my-reports">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <SectionHeading
                  eyebrow="My Reported Dogs"
                  title="Report History & Rescue Status"
                  body="Real-time status updates, rescue team responses, and location logs for dogs you reported."
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {[
                  { id: "ALL", label: `All Reports (${userReports.length})` },
                  { id: "ACTIVE", label: `In Rescue (${activeReportCount})` },
                  { id: "RESOLVED", label: `Rescued & Safe (${resolvedReportCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setReportFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      reportFilter === tab.id
                        ? "bg-bow-forest text-primary-foreground border-bow-forest"
                        : "bg-background border-border hover:bg-bow-sand text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredReports.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredReports.map((report) => {
                  const status = report.status ?? "OPEN";
                  const isResolved = ["RESOLVED", "HELP_PROVIDED", "Rescued Successfully"].includes(status);
                  const isAccepted = ["ACCEPTED", "RESCUE_IN_PROGRESS"].includes(status);
                  const isOpen = ["OPEN", "Sent to rescue team", "Reviewed"].includes(status);

                  return (
                    <BowCard
                      key={report.id}
                      className={`p-6 flex flex-col justify-between transition-all ${
                        isResolved
                          ? "border-emerald-300 bg-emerald-50/20"
                          : isAccepted
                            ? "border-blue-300 bg-blue-50/20"
                            : "border-amber-300 bg-amber-50/20"
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Top Info Bar */}
                        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-bow-forest">
                              #{report.id}
                            </span>
                            <PriorityBadge priority={report.priority} />
                          </div>
                          <span className="text-[0.68rem] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {getTimeAgo(report.createdAt)}
                          </span>
                        </div>

                        {/* Dog Photo & Details */}
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img
                            src={getReportPhoto(report.id, report.imageUrl)}
                            alt={`Reported dog ${report.id}`}
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800";
                            }}
                            className="h-36 w-full sm:w-40 object-cover rounded-lg border border-border shrink-0 shadow-2xs"
                          />

                          <div className="flex-1 space-y-2">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-bow-forest hover:underline group/map cursor-pointer"
                              title="Open location on Google Maps"
                            >
                              <MapPin className="h-3.5 w-3.5 text-bow-brown shrink-0" />
                              <span className="line-clamp-2">{report.location}</span>
                              <ExternalLink className="h-3 w-3 opacity-60 group-hover/map:opacity-100 shrink-0" />
                            </a>

                            <p className="text-xs text-foreground/90 leading-relaxed bg-background/80 p-2.5 rounded-md border border-border">
                              “{report.description}”
                            </p>

                            {report.indicators && report.indicators.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {report.indicators.slice(0, 3).map((ind, i) => (
                                  <span
                                    key={i}
                                    className="text-[0.65rem] bg-bow-sand px-2 py-0.5 rounded text-bow-forest border border-border font-medium"
                                  >
                                    {ind}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* EMOTIONAL RESCUE STATUS BANNER */}
                        <div
                          className={`rounded-xl p-4 border text-xs space-y-1.5 ${
                            isResolved
                              ? "bg-emerald-100/90 border-emerald-300 text-emerald-950"
                              : isAccepted
                                ? "bg-blue-100/90 border-blue-300 text-blue-950"
                                : "bg-amber-100/90 border-amber-300 text-amber-950"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold uppercase tracking-wider text-[0.68rem] flex items-center gap-1.5">
                              {isResolved ? (
                                <>
                                  <BadgeCheck className="h-4 w-4 text-emerald-700" />
                                  Status: Rescued & Safe ✓
                                </>
                              ) : isAccepted ? (
                                <>
                                  <UserCheck className="h-4 w-4 text-blue-700" />
                                  Status: Rescue In Progress 🚨
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4 text-amber-700" />
                                  Status: Queued for Rescue Team ⏳
                                </>
                              )}
                            </span>

                            {report.acceptedBy && (
                              <span className="text-[0.68rem] font-medium bg-background/70 px-2 py-0.5 rounded border border-border">
                                Volunteer: {report.acceptedBy}
                              </span>
                            )}
                          </div>

                          <p className="leading-relaxed font-medium">
                            {isResolved ? (
                              "🎉 Heartwarming Update: This street dog was successfully rescued and provided with essential care! Thank you for taking action."
                            ) : isAccepted ? (
                              `💙 Rescue Team Update: Volunteer ${report.acceptedBy ?? "Assigned Coordinator"} accepted this case and is actively managing field response.`
                            ) : (
                              "💛 Your report is live in the rescue network queue. Nearby volunteers and rescue teams are notified to accept."
                            )}
                          </p>
                        </div>

                        {/* Rescue Updates Log Timeline */}
                        {report.rescueUpdates && report.rescueUpdates.length > 0 && (
                          <div className="rounded-lg bg-background border border-border p-3 space-y-2">
                            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <MessageCircle className="h-3.5 w-3.5 text-bow-brown" /> Rescue Team Activity Log:
                            </p>
                            <div className="space-y-1.5 text-xs">
                              {report.rescueUpdates.map((upd, idx) => (
                                <div key={idx} className="flex items-start justify-between text-[0.72rem] border-t border-border/40 pt-1.5">
                                  <span>{upd.note}</span>
                                  <span className="text-[0.65rem] text-muted-foreground shrink-0 ml-2">
                                    {getTimeAgo(upd.time)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-[0.68rem] text-muted-foreground">
                          Reporter: {report.email}
                        </span>
                        <Button asChild variant="outline" size="sm" className="text-xs rounded-lg border-border">
                          <Link to="/rescue">View Case on Rescue Feed</Link>
                        </Button>
                      </div>
                    </BowCard>
                  );
                })}
              </div>
            ) : (
              <BowCard className="p-10 text-center bg-bow-paper border-dashed border-bow-brown/30">
                <PawPrint className="mx-auto h-10 w-10 text-bow-brown opacity-50" />
                <h4 className="mt-3 font-display text-2xl">No reported street souls yet</h4>
                <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  When you spot a street dog needing food, medical support, or shelter, share a quick photo and location. Your report alerts local rescue teams instantly!
                </p>
                <Button asChild className="mt-5 bg-bow-forest text-xs text-primary-foreground rounded-lg px-6">
                  <Link to="/report">Report a Street Soul Now →</Link>
                </Button>
              </BowCard>
            )}
          </div>

          {/* SECTION 2: ASSIGNED RESCUE CASES (Single-Accept) */}
          <div className="pt-8 border-t border-border space-y-6">
            <SectionHeading
              eyebrow="Single-Accept Assigned Cases"
              title="My Accepted Rescue Cases"
              body="Rescue cases you have accepted for single-volunteer coordination and care."
            />

            {assignedCases.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assignedCases.map((report) => (
                  <BowCard key={report.id} className="p-5 flex flex-col justify-between border-bow-forest/40">
                    <div>
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt={report.id}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800";
                          }}
                          className="h-44 w-full object-cover rounded-lg border border-border shadow-2xs"
                        />
                      ) : (
                        <div className="h-44 w-full bg-bow-sand rounded-lg border border-border flex items-center justify-center text-xs text-muted-foreground">
                          No photo attached
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-mono text-xs text-bow-forest font-bold">
                          Case #{report.id}
                        </span>
                        <PriorityBadge priority={report.priority} />
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(report.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-bow-forest hover:underline"
                      >
                        <MapPin className="h-3.5 w-3.5 text-bow-brown shrink-0" />
                        <span className="line-clamp-1">{report.location}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>

                      <p className="mt-2 text-xs text-muted-foreground line-clamp-3 bg-bow-sand/40 p-2.5 rounded-md border border-border">
                        {report.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[0.68rem] uppercase tracking-wider font-semibold text-muted-foreground">
                          Status:
                        </span>
                        <span className="font-bold px-2 py-0.5 rounded-md text-[0.7rem] bg-bow-forest text-primary-foreground">
                          {report.status}
                        </span>
                      </div>
                      <Button asChild size="sm" className="w-full text-xs rounded-lg bg-bow-forest">
                        <Link to="/rescue">Manage Case on Rescue Feed</Link>
                      </Button>
                    </div>
                  </BowCard>
                ))}
              </div>
            ) : (
              <BowCard className="p-8 text-center bg-bow-paper">
                <PawPrint className="mx-auto h-8 w-8 text-bow-brown opacity-50" />
                <h4 className="mt-3 font-display text-xl">No assigned rescue cases claimed</h4>
                <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                  Browse available cases on the Rescue Feed and click "Accept Rescue Case" to begin coordinating rescue care!
                </p>
                <Button asChild className="mt-4 bg-bow-forest text-xs text-primary-foreground rounded-lg">
                  <Link to="/rescue">Explore Available Cases</Link>
                </Button>
              </BowCard>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
