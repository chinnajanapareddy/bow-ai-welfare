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
  getReportsServerFn,
  updateCaseStatusServerFn,
  type BowReport,
  type RescueUpdate,
} from "@/lib/bow-backend.server";

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

function Rescue() {
  const getReports = useServerFn(getReportsServerFn);
  const askBowAiFn = useServerFn(askBowAiServerFn);
  const acceptCaseFn = useServerFn(acceptCaseServerFn);
  const updateStatusFn = useServerFn(updateCaseStatusServerFn);

  const [reports, setReports] = useState<BowReport[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "MY_CASES" | "RESOLVED">("ALL");

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
  }, []);


  const queue = useMemo(() => {
    if (reports.length > 0) {
      return reports.map((r) => ({
        ...r,
        timeAgo: getTimeAgo(r.createdAt),
        displayStatus: r.status || "OPEN",
      }));
    }

    return cases.map((c) => ({
      id: c.id,
      location: c.location,
      description: "Street dog requires medical assessment and volunteer care.",
      priority: c.priority as any,
      status: c.status || "OPEN",
      displayStatus: c.status || "OPEN",
      createdAt: new Date().toISOString(),
      timeAgo: "15m ago",
      email: "community@bow.org",
      imageUrl: undefined as string | undefined,
      confidence: 94,
      indicators: ["Mobility issue detected", "Posture anomaly", "Location confirmed"],
      whyPriority: "Assigned based on visual cues and incident urgency.",
      immediateActions: ["Offer clean water", "Keep a safe distance"],
      rescueUpdates: [],
      acceptedBy: undefined as string | undefined,
      acceptedByName: undefined as string | undefined,
      acceptedAt: undefined as string | undefined,
    }));

  }, [reports]);

  const filteredQueue = useMemo(() => {
    if (filter === "OPEN") {
      return queue.filter(
        (c) =>
          !c.acceptedBy &&
          ["OPEN", "Sent to rescue team", "Reviewed"].includes(c.displayStatus),
      );
    }
    if (filter === "MY_CASES") {
      if (!currentUser) return [];
      return queue.filter(
        (c) =>
          c.acceptedBy && c.acceptedBy.toLowerCase() === currentUser.email.toLowerCase(),
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

  // CRITICAL SINGLE-ACCEPT HANDLER
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
        setAcceptError(result.message ?? "This rescue case has already been accepted.");
        await loadReports();
        return;
      }

      setAcceptSuccess("Case Accepted! You are now the assigned rescue volunteer.");
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

                <Button variant="ghost" size="sm" onClick={() => void loadReports()} className="text-xs text-muted-foreground">
                  🔄 Refresh Feed
                </Button>
              </div>

              {/* Case Cards List */}
              <div className="grid gap-5">
                {filteredQueue.map((item) => {
                  const isOpen = !item.acceptedBy && ["OPEN", "Sent to rescue team", "Reviewed"].includes(item.displayStatus);
                  const isAccepted = item.displayStatus === "ACCEPTED" || item.displayStatus === "RESCUE_IN_PROGRESS";
                  const isMine = currentUser && item.acceptedBy && item.acceptedBy.toLowerCase() === currentUser.email.toLowerCase();

                  return (
                    <BowCard
                      key={item.id}
                      className={`p-5 transition-all ${
                        selectedCase?.id === item.id ? "ring-2 ring-bow-forest shadow-md" : "hover:border-bow-brown/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Image Thumbnail */}
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.id}
                            className="h-32 sm:h-36 w-full sm:w-44 object-cover rounded-lg border border-border shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="h-32 sm:h-36 w-full sm:w-44 bg-bow-sand rounded-lg border border-border flex items-center justify-center text-xs text-muted-foreground shrink-0">
                            No photo uploaded
                          </div>
                        )}

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
                                <span className="text-[0.68rem] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                  ✓ Accepted by {isMine ? "You" : (item.acceptedByName || item.acceptedBy)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </BowCard>
                  );
                })}
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
                  {selectedCase.imageUrl ? (
                    <div className="overflow-hidden rounded-xl border border-border shadow-xs">
                      <img
                        src={selectedCase.imageUrl}
                        alt={`Dog rescue case ${selectedCase.id}`}
                        className="h-56 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-bow-sand rounded-xl border border-border flex items-center justify-center text-xs text-muted-foreground">
                      No photo attached to this report
                    </div>
                  )}

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

                      {(selectedCase.acceptedBy || selectedCase.acceptedByName) ? (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950 space-y-1">
                          <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-emerald-600" />
                            Case Accepted by {selectedCase.acceptedByName || selectedCase.acceptedBy}
                          </p>
                          <p className="text-[0.68rem] text-emerald-800">
                            Claimed at: {selectedCase.acceptedAt ? new Date(selectedCase.acceptedAt).toLocaleString() : "Recently"}
                          </p>
                        </div>
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

                    {/* Authorized Status Update Controls for Assigned Volunteer or Rescue Team */}
                    {currentUser &&
                      selectedCase.acceptedBy &&
                      (selectedCase.acceptedBy.toLowerCase() === currentUser.email.toLowerCase() ||
                        currentUser.role === "Rescue Team" ||
                        currentUser.role === "Admin") && (
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
