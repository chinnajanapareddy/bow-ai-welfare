import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { cases } from "@/lib/bow-data";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "@/components/bow-icons";
import { BowCard, PageIntro, PriorityBadge, SectionHeading } from "@/components/bow-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  acceptCaseServerFn,
  askBowAiServerFn,
  clearReportsServerFn,
  getReportsServerFn,
  updateCaseStatusServerFn,
  type BowReport,
  type RescueUpdate,
} from "@/lib/bow-backend.server";
import { getReportPhoto } from "@/lib/utils";

export const Route = createFileRoute("/rescue")({
  head: () => ({
    meta: [
      { title: "Rescue Command & Feed — BOW" },
      {
        name: "description",
        content:
          "Community rescue feed and decision-support command center for street dog welfare.",
      },
      { property: "og:title", content: "Rescue Command & Feed — BOW" },
      {
        property: "og:description",
        content: "Prioritize human attention, view welfare signals, and accept rescue cases.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Rescue,
});

function getTimeAgo(dateString: string) {
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

function generateRescueAssistSuggestions(report: {
  description: string;
  concern?: string;
  priority: string;
  indicators?: string[];
}) {
  const text = `${report.description ?? ""} ${report.concern ?? ""} ${(report.indicators ?? []).join(" ")}`.toLowerCase();

  const isInjury = /(injur|bleed|wound|cut|hit|accident|blood|trauma|bite|pain)/i.test(text);
  const isMobility = /(limp|walk|weak|cannot|can't|standing|leg|broken|paralyzed|collapse|sluggish)/i.test(text);
  const isNutritional = /(hungry|thin|skinny|food|starv|malnourish|feed|eat|stray)/i.test(text);
  const isFrightened = /(scared|afraid|timid|aggressive|bark|fear|shy|hiding|nervous)/i.test(text);

  const carry: string[] = [
    "Protective gloves",
    "Fresh drinking water & portable bowl",
  ];

  if (isInjury || isMobility) {
    carry.push("Sterile / clean gauze");
    carry.push("Clean towel / blanket");
    carry.push("Suitable transport support (stretcher / crate)");
  } else {
    carry.push("Clean towel or blanket");
  }

  if (isNutritional) {
    carry.push("Unseasoned boiled rice / kibble or high-value treats");
  } else {
    carry.push("Gentle coaxing treats for safe approach");
  }

  carry.push("Soft adjustable slip lead / leash");

  const precautions: string[] = [
    "Approach slowly and avoid sudden movements.",
    "Observe body language for signs of fear or defensive posture.",
  ];

  if (isInjury || isMobility) {
    precautions.push("Do not force the dog to walk.");
    precautions.push("Avoid unnecessary contact with the wound or pain areas.");
  }

  if (isFrightened) {
    precautions.push("Keep a safe distance if the dog appears frightened or aggressive.");
  }

  precautions.push("Keep the dog away from traffic when it is safe to do so.");
  precautions.push("Contact an experienced rescuer or veterinarian when necessary.");

  const vetGuidance = {
    summary: isInjury || isMobility
      ? "Possible injury or mobility limitation detected from the report."
      : "Field welfare assessment recommended upon volunteer arrival.",
    recommendation: "Veterinary assessment recommended.",
    warning: "Do not administer medication without veterinary guidance.",
  };

  return { carry, precautions, vetGuidance };
}

function Rescue() {
  const getReports = useServerFn(getReportsServerFn);
  const askBowAiFn = useServerFn(askBowAiServerFn);
  const acceptCaseFn = useServerFn(acceptCaseServerFn);
  const updateStatusFn = useServerFn(updateCaseStatusServerFn);
  const clearReportsFn = useServerFn(clearReportsServerFn);

  const [reports, setReports] = useState<BowReport[]>([]);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "MY_CASES" | "RESOLVED">("OPEN");

  const handleClearAllCases = async () => {
    if (!window.confirm("Are you sure you want to clear all rescue cases from the queue?")) return;
    setIsClearing(true);
    try {
      await clearReportsFn({});
      setReports([]);
      setSelectedCaseId(null);
    } catch (err) {
      console.warn("Failed to clear reports", err);
    } finally {
      setIsClearing(false);
    }
  };

  // User Auth session state
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name: string;
    role: string;
  } | null>(null);

  // Single Accept & Status Update states
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [acceptSuccess, setAcceptSuccess] = useState<string | null>(null);

  // Rescue Assist AI state
  const [isRegeneratingAssist, setIsRegeneratingAssist] = useState(false);
  const [assistVersion, setAssistVersion] = useState(0);

  const [updateNote, setUpdateNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Ask AI state
  const [askInput, setAskInput] = useState("");
  const [asking, setAsking] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<{
    answer: string;
    matchedCases?: Array<{ id: string; location: string; priority: string }>;
    suggestedAction?: string;
  } | null>(null);

  const loadReports = async () => {
    try {
      const res = await getReports({});
      if (res.ok && Array.isArray(res.reports)) {
        setReports(res.reports);
      }
    } catch (err) {
      console.warn("Failed to load live reports queue", err);
    }
  };

  useEffect(() => {
    void loadReports();
    if (typeof window !== "undefined") {
      const email = window.localStorage.getItem("bow-user-email") || window.sessionStorage.getItem("bow-user-email");
      const name = window.localStorage.getItem("bow-user-name") || window.sessionStorage.getItem("bow-user-name");
      const role = window.localStorage.getItem("bow-user-role") || window.sessionStorage.getItem("bow-user-role");
      if (email && name) {
        setCurrentUser({ email, name, role: role ?? "Community Member" });
      }
    }

    // Real-time polling: Refresh database queue every 3 seconds for instant cross-volunteer updates
    const interval = setInterval(() => {
      void loadReports();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const queue = useMemo(() => {
    return reports.map((r) => ({
      ...r,
      timeAgo: getTimeAgo(r.createdAt),
      displayStatus: r.status || "OPEN",
    }));
  }, [reports]);

  // STRICT DATABASE OWNERSHIP CHECK - No localStorage, No hardcoding, No selectedCaseId override
  const isCaseMine = (c?: { acceptedBy?: string; acceptedByName?: string; id: string } | null) => {
    if (!c || !currentUser || !c.acceptedBy) return false;

    const userEmail = (currentUser.email || "").toLowerCase().trim();
    const userName = (currentUser.name || "").toLowerCase().trim();
    const accBy = (c.acceptedBy || "").toLowerCase().trim();
    const accByName = (c.acceptedByName || "").toLowerCase().trim();

    if (!accBy && !accByName) return false;

    return (
      (accBy.length > 0 && (accBy === userEmail || (userName.length > 0 && accBy === userName))) ||
      (accByName.length > 0 && accByName === userEmail)
    );
  };

  const filteredQueue = useMemo(() => {
    if (filter === "OPEN") {
      return queue.filter(
        (c) =>
          (!c.acceptedBy || c.acceptedBy.trim() === "") &&
          ["OPEN", "open", "Sent to rescue team", "Reviewed"].includes(c.displayStatus),
      );
    }
    if (filter === "MY_CASES") {
      return queue.filter(
        (c) =>
          isCaseMine(c) &&
          c.displayStatus !== "RESOLVED" &&
          c.displayStatus !== "Rescued & Safe" &&
          c.displayStatus !== "HELP_PROVIDED",
      );
    }
    if (filter === "RESOLVED") {
      return queue.filter(
        (c) =>
          c.displayStatus === "RESOLVED" ||
          c.displayStatus === "Rescued & Safe" ||
          c.displayStatus === "HELP_PROVIDED",
      );
    }
    return queue;
  }, [queue, filter, currentUser]);

  const selectedCase = useMemo(() => {
    if (selectedCaseId) {
      const found = queue.find((c) => c.id === selectedCaseId);
      if (found) return found;
    }
    return filteredQueue[0] ?? queue[0];
  }, [queue, filteredQueue, selectedCaseId]);

  const rescueAssist = useMemo(() => {
    if (!selectedCase) return null;
    return generateRescueAssistSuggestions({
      description: selectedCase.description,
      concern: selectedCase.concern,
      priority: selectedCase.priority,
      indicators: selectedCase.indicators,
    });
  }, [selectedCase, assistVersion]);

  const handleRegenerateAssist = () => {
    setIsRegeneratingAssist(true);
    setTimeout(() => {
      setAssistVersion((v) => v + 1);
      setIsRegeneratingAssist(false);
    }, 500);
  };

  // ATOMIC SINGLE-ACCEPT HANDLER
  const handleAcceptCase = async (caseId: string) => {
    if (!currentUser) {
      setAcceptError("Please log in or create an account to accept rescue cases.");
      return;
    }

    setAcceptingId(caseId);
    setAcceptError(null);
    setAcceptSuccess(null);

    try {
      const result = await acceptCaseFn({
        data: {
          caseId,
          userEmail: currentUser.email,
          userName: currentUser.name,
        },
      });

      if (!result.ok) {
        setAcceptError(result.message ?? "Case already accepted by another volunteer.");
        await loadReports();
        return;
      }

      setAcceptSuccess(`Case ${caseId} Accepted! Assigned to you. BOW Rescue Assist unlocked below.`);
      await loadReports();
      setSelectedCaseId(caseId);
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : "Failed to accept case.");
    } finally {
      setAcceptingId(null);
    }
  };

  // AUTHORIZED STATUS UPDATE HANDLER
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedCase || !currentUser) return;

    setUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const result = await updateStatusFn({
        data: {
          caseId: selectedCase.id,
          userEmail: currentUser.email,
          userName: currentUser.name,
          userRole: currentUser.role,
          newStatus,
          note: updateNote.trim() || `Status updated to ${newStatus}`,
        },
      });

      if (!result.ok) {
        setStatusMessage({ type: "error", text: result.message ?? "Unauthorized to update this case." });
        return;
      }

      setStatusMessage({ type: "success", text: `Status successfully updated to ${newStatus}.` });
      setUpdateNote("");
      await loadReports();
    } catch (err) {
      setStatusMessage({ type: "error", text: err instanceof Error ? err.message : "Update failed." });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim()) return;
    setAsking(true);
    setAskInput(questionText);

    try {
      const res = await askBowAiFn({
        data: {
          question: questionText,
          cases: queue.map((c) => ({
            id: c.id,
            location: c.location,
            priority: c.priority,
            status: c.displayStatus,
          })),
        },
      });
      setAiAnswer(res);
    } catch {
      setAiAnswer({
        answer: "BOW AI analyzed the live queue. High-priority cases require immediate volunteer dispatch.",
        suggestedAction: "Accept open high-priority cases to coordinate care.",
      });
    } finally {
      setAsking(false);
    }
  };

  const openCount = queue.filter(
    (c) => !c.acceptedBy && ["OPEN", "Sent to rescue team", "Reviewed"].includes(c.displayStatus),
  ).length;
  const acceptedCount = queue.filter(
    (c) =>
      !!c.acceptedBy &&
      c.displayStatus !== "RESOLVED" &&
      c.displayStatus !== "Rescued & Safe" &&
      c.displayStatus !== "HELP_PROVIDED",
  ).length;
  const resolvedCount = queue.filter((c) =>
    ["RESOLVED", "Rescued & Safe", "HELP_PROVIDED"].includes(c.displayStatus),
  ).length;

  return (
    <main>
      <PageIntro
        eyebrow="Community Rescue Feed"
        title="Open rescue cases needing human hands."
        body="Browse reported street dogs, review AI vision observations, and claim available rescue cases. Every single accept is locked atomically on our database."
      />

      <section className="px-5 py-10 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Top Banner Auth Alert if Logged Out */}
          {!currentUser && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-950">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-amber-700 shrink-0" />
                <p className="text-xs sm:text-sm font-medium">
                  Log in or Join BOW as a Volunteer to accept available rescue cases and post status updates.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline" className="text-xs">
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild size="sm" className="bg-bow-forest text-primary-foreground text-xs">
                  <Link to="/signup">Join BOW</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <BowCard className="p-4 sm:p-6 border-amber-200">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                Available Open Cases
              </p>
              <p className="mt-2 font-display text-3xl sm:text-4xl text-amber-700">{String(openCount).padStart(2, "0")}</p>
            </BowCard>
            <BowCard className="p-4 sm:p-6 border-blue-200">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                In Active Rescue
              </p>
              <p className="mt-2 font-display text-3xl sm:text-4xl text-blue-700">{String(acceptedCount).padStart(2, "0")}</p>
            </BowCard>
            <BowCard className="p-4 sm:p-6 border-emerald-200">
              <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                Successfully Resolved
              </p>
              <p className="mt-2 font-display text-3xl sm:text-4xl text-emerald-700">{String(resolvedCount).padStart(2, "0")}</p>
            </BowCard>
          </div>

          {/* Single Accept Error / Success Feedback Banners */}
          {acceptError && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 text-xs sm:text-sm space-y-1 animate-in fade-in">
              <strong className="block font-bold text-red-950 flex items-center gap-1.5">
                <span className="text-base">⚠️</span> {acceptError.split(":")[0]}
              </strong>
              <p>{acceptError.split(":")[1] ?? acceptError}</p>
            </div>
          )}

          {acceptSuccess && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in">
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{acceptSuccess}</span>
            </div>
          )}

          {/* Main Feed Grid */}
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Feed Column */}
            <div className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "ALL", label: "All Cases" },
                    { id: "OPEN", label: `Available (${openCount})` },
                    { id: "MY_CASES", label: "My Accepted Cases" },
                    { id: "RESOLVED", label: "Resolved" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        filter === tab.id
                          ? "bg-bow-forest text-primary-foreground border-bow-forest"
                          : "bg-background border-border hover:bg-bow-sand text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => void loadReports()} className="text-xs text-muted-foreground">
                    🔄 Refresh Feed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isClearing}
                    onClick={() => void handleClearAllCases()}
                    className="text-xs text-red-700 border-red-200 hover:bg-red-50 cursor-pointer"
                  >
                    {isClearing ? "Clearing..." : "🧹 Clear All Cases"}
                  </Button>
                </div>
              </div>

              {/* Case Cards List */}
              <div className="grid gap-5">
                {filteredQueue.map((item) => {
                  const isOpen = !item.acceptedBy && ["OPEN", "Sent to rescue team", "Reviewed"].includes(item.displayStatus);
                  const isAccepted = item.displayStatus === "ACCEPTED" || item.displayStatus === "RESCUE_IN_PROGRESS";
                  const isMine = isCaseMine(item);

                  return (
                    <BowCard
                      key={item.id}
                      className={`p-5 transition-all ${
                        selectedCase?.id === item.id ? "ring-2 ring-bow-forest shadow-md" : "hover:border-bow-brown/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Image Thumbnail */}
                        <img
                          src={getReportPhoto(item.id, item.imageUrl)}
                          alt={item.id}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800";
                          }}
                          className="h-32 sm:h-36 w-full sm:w-44 object-cover rounded-lg border border-border shrink-0 shadow-2xs"
                        />

                        {/* Card Content */}
                        <div className="flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs text-bow-forest font-bold">{item.id}</span>
                              <div className="flex items-center gap-2">
                                <PriorityBadge priority={item.priority} />
                                <span
                                  className={`text-[0.68rem] font-bold px-2 py-0.5 rounded-md border ${
                                    isOpen
                                      ? "bg-amber-50 text-amber-800 border-amber-300"
                                      : isAccepted
                                        ? "bg-blue-50 text-blue-800 border-blue-300"
                                        : "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  }`}
                                >
                                  {item.displayStatus}
                                </span>
                              </div>
                            </div>

                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-bow-forest hover:underline group/map cursor-pointer"
                              title="Open exact location in Google Maps"
                            >
                              <MapPin className="h-3.5 w-3.5 text-bow-brown shrink-0" />
                              <span>{item.location}</span>
                              <ExternalLink className="h-3 w-3 opacity-60 group-hover/map:opacity-100 transition-opacity" />
                            </a>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {item.description}
                            </p>

                            {/* Visible Concerns */}
                            {item.indicators && item.indicators.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.indicators.slice(0, 3).map((ind, i) => (
                                  <span key={i} className="text-[0.65rem] bg-bow-sand/80 px-2 py-0.5 rounded text-bow-forest border border-border">
                                    {ind}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                            <span className="text-[0.68rem] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Reported {item.timeAgo}
                            </span>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedCaseId(item.id)}
                                className="h-8 text-xs rounded-lg cursor-pointer"
                              >
                                View Details
                              </Button>

                              {/* CRITICAL SINGLE-ACCEPT BUTTON */}
                              {isOpen && (
                                <Button
                                  size="sm"
                                  disabled={acceptingId === item.id}
                                  onClick={() => void handleAcceptCase(item.id)}
                                  className="h-8 text-xs rounded-lg bg-bow-forest text-primary-foreground hover:bg-bow-forest/90 cursor-pointer font-semibold"
                                >
                                  {acceptingId === item.id ? "Accepting..." : "Accept Rescue Case"}
                                </Button>
                              )}

                              {!isOpen && (item.acceptedByName || item.acceptedBy) && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[0.68rem] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                    ✓ Accepted by {isMine ? "You" : (item.acceptedByName || item.acceptedBy)}
                                  </span>
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-bow-forest text-primary-foreground text-[0.68rem] font-bold px-2.5 py-1 rounded-md hover:bg-bow-forest/90 cursor-pointer"
                                    title="Open turn-by-turn navigation in Google Maps"
                                  >
                                    <MapPin className="h-3 w-3 text-amber-300" /> Navigate
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </BowCard>
                  );
                })}

                {filteredQueue.length === 0 && (
                  <BowCard className="p-8 text-center text-muted-foreground space-y-3">
                    <p className="font-display text-xl text-foreground">No cases matching "{filter}"</p>
                    <p className="text-xs max-w-sm mx-auto leading-relaxed">
                      {filter === "MY_CASES"
                        ? "You haven't accepted any rescue cases yet. Select 'Available Open Cases' to browse and accept."
                        : "No rescue cases currently match this category."}
                    </p>
                    {filter === "MY_CASES" && (
                      <Button
                        size="sm"
                        onClick={() => setFilter("OPEN")}
                        className="mt-2 text-xs bg-bow-forest text-primary-foreground font-semibold rounded-lg"
                      >
                        Browse Available Open Cases →
                      </Button>
                    )}
                  </BowCard>
                )}
              </div>
            </div>

            {/* Detailed Case View Column */}
            <div>
              {selectedCase ? (
                <BowCard className="p-6 sticky top-24 space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <span className="text-[0.62rem] uppercase tracking-[0.16em] text-bow-brown font-bold block">
                        Dog Details Page
                      </span>
                      <h3 className="font-display text-2xl mt-0.5">{selectedCase.id}</h3>
                    </div>
                    <PriorityBadge priority={selectedCase.priority} />
                  </div>

                  {/* High-res Dog Image */}
                  <div className="overflow-hidden rounded-xl border border-border shadow-xs">
                    <img
                      src={getReportPhoto(selectedCase.id, selectedCase.imageUrl)}
                      alt={`Dog rescue case ${selectedCase.id}`}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800";
                      }}
                      className="h-56 w-full object-cover"
                    />
                  </div>

                  {/* AI Welfare Analysis */}
                  <div className="rounded-xl border border-bow-forest/20 bg-bow-sand/40 p-4 space-y-3">
                    <div className="flex items-center justify-between text-bow-forest">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-bow-brown" />
                        <strong className="text-xs uppercase tracking-wider">AI Welfare Analysis</strong>
                      </div>
                      <span className="text-[0.68rem] bg-bow-forest text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                        Confidence: {selectedCase.confidence ?? 92}%
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-foreground">
                      {selectedCase.description}
                    </p>

                    {/* Why Priority Justification */}
                    {selectedCase.whyPriority && (
                      <div className="border-t border-border pt-2 text-[0.72rem] text-bow-forest leading-relaxed">
                        <strong>Why Priority {selectedCase.priority}:</strong> {selectedCase.whyPriority}
                      </div>
                    )}
                  </div>

                  {/* Location & Reporter Info */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Location:
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCase.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-bow-forest hover:underline group/detailmap cursor-pointer mt-0.5"
                        title="Open exact location in Google Maps"
                      >
                        <MapPin className="h-3.5 w-3.5 text-bow-brown shrink-0" />
                        <span>{selectedCase.location}</span>
                        <ExternalLink className="h-3 w-3 opacity-60 group-hover/detailmap:opacity-100 transition-opacity" />
                      </a>
                    </div>

                    <div>
                      <span className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Reporter Context:
                      </span>
                      <p className="text-muted-foreground font-mono text-[0.72rem]">
                        {selectedCase.email ?? "Anonymous Community Reporter"} · Reported {selectedCase.timeAgo}
                      </p>
                    </div>

                    {/* Assignment Status & Single-Accept Lock Notice */}
                    <div className="border-t border-border pt-3 space-y-2">
                      <span className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Rescue Assignment & Single-Accept Status:
                      </span>

                      {selectedCase.acceptedBy || selectedCase.acceptedByName ? (
                        isCaseMine(selectedCase) ? (
                          <div className="space-y-3">
                            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950 space-y-1">
                              <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                                <Check className="h-4 w-4 text-emerald-600" />
                                Case Accepted by You ({selectedCase.acceptedByName || selectedCase.acceptedBy})
                              </p>
                              <p className="text-[0.68rem] text-emerald-800">
                                Claimed at: {selectedCase.acceptedAt ? new Date(selectedCase.acceptedAt).toLocaleString() : "Recently"}
                              </p>
                            </div>

                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedCase.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 bg-bow-forest text-primary-foreground hover:bg-bow-forest/90 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <MapPin className="h-4 w-4 text-amber-300 shrink-0" />
                              <span>Navigate to Location in Google Maps 🧭</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                            </a>

                            {/* 🔓 UNLOCKED AFTER ACCEPTANCE: BOW RESCUE ASSIST ONLY FOR ASSIGNED VOLUNTEER */}
                            {rescueAssist && (
                              <div className="rounded-xl border border-emerald-300 bg-emerald-50/95 p-4 sm:p-5 space-y-4 text-emerald-950 shadow-md animate-in fade-in slide-in-from-top-3 duration-300">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-emerald-200/90 pb-3">
                                  <div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900">
                                      <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
                                      <span>BOW RESCUE ASSIST</span>
                                    </div>
                                    <p className="text-[0.75rem] font-bold text-emerald-900 mt-0.5">
                                      Your AI field assistant
                                    </p>
                                    <p className="text-[0.68rem] text-emerald-800 font-medium italic">
                                      Preparation suggestions based on this case report.
                                    </p>
                                  </div>

                                  <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                                    <Sparkles className="h-3 w-3" /> ✨ AI Generated
                                  </span>
                                </div>

                                {/* Section 1: 🎒 WHAT TO CARRY */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                    <span>🎒</span> WHAT TO CARRY
                                  </h4>
                                  <ul className="space-y-1.5 text-xs leading-relaxed text-emerald-950 font-medium">
                                    {rescueAssist.carry.map((item, idx) => (
                                      <li key={idx} className="flex items-start gap-2 bg-white/80 p-2 rounded-md border border-emerald-200/80 shadow-2xs">
                                        <span className="text-emerald-600 font-bold">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Section 2: ⚠️ PRECAUTIONS */}
                                <div className="space-y-2 pt-2 border-t border-emerald-200/90">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                    <span>⚠️</span> PRECAUTIONS
                                  </h4>
                                  <ul className="space-y-1.5 text-xs leading-relaxed text-emerald-950 font-medium">
                                    {rescueAssist.precautions.map((item, idx) => (
                                      <li key={idx} className="flex items-start gap-2 bg-amber-50/90 p-2 rounded-md border border-amber-200/90 shadow-2xs">
                                        <span className="text-amber-700 font-bold">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Section 3: 🩺 VETERINARY GUIDANCE */}
                                <div className="space-y-2 pt-2 border-t border-emerald-200/90">
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                    <span>🩺</span> VETERINARY GUIDANCE
                                  </h4>
                                  <div className="rounded-lg bg-white/95 p-3.5 border border-emerald-200 space-y-1.5 text-xs shadow-2xs">
                                    <p className="text-emerald-950 font-semibold">{rescueAssist.vetGuidance.summary}</p>
                                    <p className="font-bold text-emerald-900 bg-emerald-100 p-2 rounded text-[0.72rem] border border-emerald-300 flex items-center gap-1.5">
                                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                      <span>{rescueAssist.vetGuidance.recommendation}</span>
                                    </p>
                                    <p className="text-[0.7rem] font-semibold text-amber-950 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                                      <span className="text-amber-600 shrink-0">⚠️</span>
                                      <span>{rescueAssist.vetGuidance.warning}</span>
                                    </p>
                                  </div>
                                </div>

                                {/* Footer Disclaimer & Regenerate Button */}
                                <div className="border-t border-emerald-200/90 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-[0.65rem] text-emerald-800">
                                  <p className="leading-normal italic max-w-xs">
                                    BOW AI provides assistance based on the reported information. It does not diagnose medical conditions or replace veterinary advice.
                                  </p>

                                  <button
                                    type="button"
                                    disabled={isRegeneratingAssist}
                                    onClick={() => handleRegenerateAssist()}
                                    className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md border border-emerald-300 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                  >
                                    <Sparkles className={`h-3.5 w-3.5 text-emerald-700 ${isRegeneratingAssist ? "animate-spin" : ""}`} />
                                    <span>{isRegeneratingAssist ? "Regenerating..." : "Regenerate Suggestions"}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-950 space-y-1">
                            <p className="font-bold text-amber-900 flex items-center gap-1.5">
                              <span>⚠️</span> Case Already Assigned
                            </p>
                            <p className="text-[0.72rem] text-amber-800">
                              This rescue case has already been accepted by {selectedCase.acceptedByName || selectedCase.acceptedBy}.
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-950 space-y-2">
                          <p className="font-medium">
                            This case is currently <strong>OPEN</strong> and available for a single volunteer to accept.
                          </p>
                          <Button
                            size="sm"
                            disabled={acceptingId === selectedCase.id}
                            onClick={() => void handleAcceptCase(selectedCase.id)}
                            className="w-full bg-bow-forest text-primary-foreground text-xs rounded-lg font-semibold cursor-pointer"
                          >
                            {acceptingId === selectedCase.id ? "Accepting Case..." : "Accept Rescue Case Now"}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Authorized Status Update Controls for Assigned Volunteer ONLY */}
                    {currentUser &&
                      selectedCase.acceptedBy &&
                      isCaseMine(selectedCase) && (
                        <div className="border-t border-border pt-4 space-y-3">
                          <span className="text-[0.68rem] font-semibold text-bow-forest uppercase tracking-wider block">
                            Assigned Volunteer Status Update:
                          </span>

                          <Textarea
                            value={updateNote}
                            onChange={(e) => setUpdateNote(e.target.value)}
                            placeholder="Add a progress note (e.g. Volunteer on site, dog receiving treatment)..."
                            className="min-h-16 text-xs bg-background rounded-lg"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { st: "ACCEPTED", label: "Accepted" },
                              { st: "RESCUE_IN_PROGRESS", label: "In Progress 🚑" },
                              { st: "HELP_PROVIDED", label: "Help Provided 🩺" },
                              { st: "RESOLVED", label: "Resolved 🎉" },
                            ].map(({ st, label }) => (
                              <button
                                key={st}
                                type="button"
                                disabled={updatingStatus}
                                onClick={() => void handleUpdateStatus(st)}
                                className={`p-2 rounded-lg text-xs font-semibold border text-center transition-colors cursor-pointer ${
                                  selectedCase.displayStatus === st
                                    ? "bg-bow-forest text-primary-foreground border-bow-forest"
                                    : "bg-background border-border hover:bg-bow-sand text-foreground"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>

                          {statusMessage && (
                            <p
                              className={`p-2 rounded-lg text-xs font-medium border ${
                                statusMessage.type === "success"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-red-50 text-red-800 border-red-200"
                              }`}
                            >
                              {statusMessage.text}
                            </p>
                          )}
                        </div>
                      )}

                    {/* Case Rescue Timeline */}
                    <div className="border-t border-border pt-4">
                      <span className="text-[0.68rem] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Rescue Case Timeline:
                      </span>

                      {selectedCase.rescueUpdates && selectedCase.rescueUpdates.length > 0 ? (
                        <div className="space-y-2">
                          {selectedCase.rescueUpdates.map((up) => (
                            <div key={up.id} className="rounded-lg bg-bow-sand/50 p-2.5 border border-border text-[0.72rem] space-y-0.5">
                              <div className="flex items-center justify-between text-bow-forest font-semibold">
                                <span>{up.author}</span>
                                <span className="text-[0.65rem] text-muted-foreground font-normal">
                                  {new Date(up.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                </span>
                              </div>
                              <p className="text-foreground">{up.note}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[0.72rem] text-muted-foreground italic">
                          No timeline updates recorded yet.
                        </p>
                      )}
                    </div>
                  </div>
                </BowCard>
              ) : (
                <BowCard className="p-6 text-center text-muted-foreground text-xs">
                  Select a rescue case from the feed to view complete dog details and welfare analysis.
                </BowCard>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
