import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Flame,
  Heart,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Utensils,
  Zap,
} from "@/components/bow-icons";
import { ActionLink, SectionHeading } from "@/components/bow-ui";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Volunteer Leaderboard & Badges — BOW" },
      {
        name: "description",
        content: "Top community rescuers, feeding drive leaders, and volunteer achievement badges.",
      },
      { property: "og:title", content: "BOW Volunteer Leaderboard & Badges" },
      { property: "og:description", content: "Celebrate top street dog rescuers and feeders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Leaderboard,
});

type LeaderboardUser = {
  rank: number;
  name: string;
  avatar: string;
  role: string;
  city: string;
  xp: number;
  casesRescued: number;
  mealsServed: number;
  level: number;
  badges: string[];
  isCurrentUser?: boolean;
};

const topVolunteers: LeaderboardUser[] = [
  {
    rank: 1,
    name: "Ananya Rao",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    role: "Senior Rescuer",
    city: "Chennai",
    xp: 2850,
    casesRescued: 24,
    mealsServed: 380,
    level: 7,
    badges: ["First Rescue Completed", "100 Meals Served", "Lightning Responder", "Community Hero"],
  },
  {
    rank: 2,
    name: "Karan Sharma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    role: "Feeding Champion",
    city: "Bengaluru",
    xp: 2420,
    casesRescued: 18,
    mealsServed: 420,
    level: 6,
    badges: ["First Rescue Completed", "100 Meals Served", "AI Signal Spotter"],
  },
  {
    rank: 3,
    name: "Priya Patel",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    role: "Medical Volunteer",
    city: "Hyderabad",
    xp: 2100,
    casesRescued: 19,
    mealsServed: 210,
    level: 5,
    badges: ["First Rescue Completed", "Lightning Responder", "Forever Home Matcher"],
  },
  {
    rank: 4,
    name: "Rahul Verma",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    role: "Community Guardian",
    city: "Mumbai",
    xp: 1750,
    casesRescued: 12,
    mealsServed: 290,
    level: 4,
    badges: ["First Rescue Completed", "100 Meals Served"],
    isCurrentUser: true,
  },
  {
    rank: 5,
    name: "Deepa Nair",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    role: "Adoption Advocate",
    city: "Kochi",
    xp: 1540,
    casesRescued: 9,
    mealsServed: 185,
    level: 4,
    badges: ["First Rescue Completed", "Forever Home Matcher"],
  },
  {
    rank: 6,
    name: "Arjun Mehta",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
    role: "Rescue Dispatcher",
    city: "Delhi",
    xp: 1320,
    casesRescued: 11,
    mealsServed: 140,
    level: 3,
    badges: ["AI Signal Spotter"],
  },
];

const achievementBadges = [
  {
    id: "rescue-1",
    title: "First Rescue Completed",
    description: "Accepted and successfully resolved your 1st street dog rescue case.",
    icon: ShieldCheck,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    xp: "+200 XP",
    unlocked: true,
  },
  {
    id: "meals-100",
    title: "100 Meals Served",
    description: "Distributed 100+ nutritious meals to street dog packs.",
    icon: Utensils,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    xp: "+350 XP",
    unlocked: true,
  },
  {
    id: "speed-15",
    title: "Lightning Responder",
    description: "Responded to a High-Priority alert within 15 minutes.",
    icon: Zap,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    xp: "+300 XP",
    unlocked: true,
  },
  {
    id: "ai-spotter",
    title: "AI Signal Spotter",
    description: "Submitted 5+ AI-verified welfare reports with photos.",
    icon: Sparkles,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    xp: "+250 XP",
    unlocked: true,
  },
  {
    id: "hero-top5",
    title: "Community Hero",
    description: "Ranked in the Top 5 monthly rescuers across the country.",
    icon: Trophy,
    color: "bg-amber-500/20 text-amber-700 border-amber-500/40",
    xp: "+500 XP",
    unlocked: true,
  },
  {
    id: "adopt-match",
    title: "Forever Home Matcher",
    description: "Facilitated 3+ successful street dog adoptions into loving homes.",
    icon: Heart,
    color: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    xp: "+400 XP",
    unlocked: false,
  },
];

function Leaderboard() {
  const [filterPeriod, setFilterPeriod] = useState<"monthly" | "alltime">("monthly");
  const currentUser = topVolunteers.find((u) => u.isCurrentUser) || topVolunteers[3];

  return (
    <main className="bg-background min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-bow-forest via-bow-forest/95 to-bow-forest text-primary-foreground px-5 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-bow-gold/30 bg-bow-paper/10 px-3.5 py-1 text-xs text-bow-gold backdrop-blur-md">
                <Trophy className="h-4 w-4" />
                <span className="eyebrow text-bow-gold">BOW Recognition & Rank</span>
              </div>

              <h1 className="mt-4 font-display text-4xl sm:text-6xl text-white tracking-tight">
                Guardian <span className="text-bow-gold italic">Leaderboard</span> & Badges
              </h1>

              <p className="mt-4 text-base text-primary-foreground/80 leading-relaxed">
                Celebrating community members, feeders, and rescue volunteers turning compassion into swift action for India's street souls.
              </p>
            </div>

            {/* Current User Summary Box */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-2xl min-w-[280px]">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-bow-gold"
                />
                <div>
                  <span className="rounded-full bg-bow-gold/20 px-2.5 py-0.5 text-[0.65rem] font-bold text-bow-gold border border-bow-gold/30 uppercase tracking-wider">
                    Your Rank #{currentUser.rank}
                  </span>
                  <h3 className="font-display text-xl text-white mt-1">{currentUser.name}</h3>
                  <p className="text-xs text-white/70">{currentUser.role} • {currentUser.city}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5 pt-4 border-t border-white/15">
                <div className="flex items-center justify-between text-xs text-white/80 font-medium mb-1.5">
                  <span>Level {currentUser.level} Guardian</span>
                  <span className="text-bow-gold">{currentUser.xp} / 2,000 XP</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-bow-gold to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${(currentUser.xp / 2000) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Leaderboard Table Section */}
      <section className="px-5 py-12 sm:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl text-foreground">Top Volunteer Champions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Rankings updated live from rescue logs and community feeding drives.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-border bg-bow-paper p-1 shadow-sm">
            <button
              onClick={() => setFilterPeriod("monthly")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                filterPeriod === "monthly"
                  ? "bg-bow-brown text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilterPeriod("alltime")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                filterPeriod === "alltime"
                  ? "bg-bow-brown text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All-Time Heroes
            </button>
          </div>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {topVolunteers.slice(0, 3).map((volunteer) => {
            const isFirst = volunteer.rank === 1;
            const isSecond = volunteer.rank === 2;
            return (
              <div
                key={volunteer.name}
                className={`relative overflow-hidden rounded-2xl border bg-bow-paper p-6 transition-all duration-300 hover:shadow-xl ${
                  isFirst
                    ? "border-bow-gold ring-2 ring-bow-gold/30 shadow-lg scale-105 md:-translate-y-2"
                    : "border-border"
                }`}
              >
                {/* Rank Badge Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      isFirst
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : isSecond
                        ? "bg-slate-100 text-slate-800 border border-slate-300"
                        : "bg-amber-50 text-amber-900 border border-amber-200"
                    }`}
                  >
                    {isFirst ? "🥇 Rank 1" : isSecond ? "🥈 Rank 2" : "🥉 Rank 3"}
                  </span>
                  <span className="text-xs font-bold text-bow-brown flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-bow-gold" />
                    {volunteer.xp} XP
                  </span>
                </div>

                {/* Profile Detail */}
                <div className="mt-5 flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={volunteer.avatar}
                      alt={volunteer.name}
                      className="h-16 w-16 rounded-full object-cover ring-4 ring-bow-sand"
                    />
                    {isFirst && (
                      <span className="absolute -top-2 -right-1 text-xl">👑</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-foreground flex items-center gap-1.5">
                      {volunteer.name}
                      <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-red-500" />
                      {volunteer.city} • <span className="text-bow-brown">{volunteer.role}</span>
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4 text-center">
                  <div className="rounded-lg bg-bow-sand/40 p-2.5">
                    <p className="font-display text-xl font-semibold text-foreground">
                      {volunteer.casesRescued}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground uppercase font-medium">Cases Rescued</p>
                  </div>
                  <div className="rounded-lg bg-bow-sand/40 p-2.5">
                    <p className="font-display text-xl font-semibold text-foreground">
                      {volunteer.mealsServed}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground uppercase font-medium">Meals Served</p>
                  </div>
                </div>

                {/* Badges Stack */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {volunteer.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-bow-brown/10 px-2 py-0.5 text-[0.65rem] font-semibold text-bow-brown"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Ranks Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-bow-paper shadow-sm">
          <div className="p-6 border-b border-border bg-bow-ivory flex items-center justify-between">
            <h3 className="font-display text-2xl text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-bow-brown" />
              Full Volunteer Leaderboard
            </h3>
            <span className="text-xs font-medium text-muted-foreground">Showing top 6 guardians</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Rank</th>
                  <th className="px-6 py-4 font-semibold">Volunteer</th>
                  <th className="px-6 py-4 font-semibold">City</th>
                  <th className="px-6 py-4 font-semibold text-center">Cases Rescued</th>
                  <th className="px-6 py-4 font-semibold text-center">Meals Served</th>
                  <th className="px-6 py-4 font-semibold text-right">XP Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topVolunteers.map((vol) => (
                  <tr
                    key={vol.name}
                    className={`transition-colors ${
                      vol.isCurrentUser
                        ? "bg-bow-brown/10 font-medium"
                        : "hover:bg-bow-sand/20"
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-foreground">
                      {vol.rank === 1 ? "🥇 1" : vol.rank === 2 ? "🥈 2" : vol.rank === 3 ? "🥉 3" : `#${vol.rank}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={vol.avatar}
                          alt={vol.name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                        />
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-1.5">
                            {vol.name}
                            {vol.isCurrentUser && (
                              <span className="rounded bg-bow-brown px-1.5 py-0.5 text-[0.62rem] text-white font-bold">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{vol.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-foreground/80">{vol.city}</td>
                    <td className="px-6 py-4 text-center font-display text-base font-semibold text-emerald-700">
                      {vol.casesRescued}
                    </td>
                    <td className="px-6 py-4 text-center font-display text-base font-semibold text-amber-700">
                      {vol.mealsServed}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-display text-lg font-bold text-bow-brown">
                        {vol.xp} XP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Achievement Badges Showcase Section */}
      <section className="px-5 py-16 sm:px-10 max-w-7xl mx-auto border-t border-border mt-12">
        <SectionHeading
          eyebrow="Volunteer Achievements"
          title="Unlock Street Soul Badges."
          body="Complete rescue missions, feeding drives, and AI signal reports to earn community badges and boost your guardian level."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievementBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
                  badge.unlocked
                    ? "border-border bg-bow-paper shadow-sm hover:shadow-md"
                    : "border-dashed border-border bg-muted/30 opacity-65"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl border ${badge.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      badge.unlocked
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {badge.unlocked ? "Unlocked ✓" : "Locked"}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-2xl text-foreground">{badge.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {badge.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs font-bold text-bow-brown">{badge.xp}</span>
                  <Link
                    to="/report"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-bow-brown"
                  >
                    Take Action <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
