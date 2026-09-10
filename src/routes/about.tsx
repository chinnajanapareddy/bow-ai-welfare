import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ActionLink, BowCard, SectionHeading } from "@/components/bow-ui";
import { getSystemStatsServerFn } from "@/lib/bow-backend.server";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Eye,
  Heart,
  MapPin,
  PawPrint,
  Quote,
  ShieldCheck,
  Sparkles,
  Users,
} from "@/components/bow-icons";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BOW — Compassion into coordinated action" },
      {
        name: "description",
        content: "Learn why BOW exists and how technology helps communities support street dogs.",
      },
      { property: "og:title", content: "About BOW" },
      { property: "og:description", content: "Compassion becomes coordinated action." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const heroDogFaces = [
  {
    id: "milo",
    name: "Milo",
    role: "Indian Pariah",
    status: "Rescued & Vaccinated",
    location: "Besant Nagar, Chennai",
    quote: "Found injured near the beach. Now healthy, vaccinated, and loved by the neighborhood.",
    image: "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=800",
    tag: "Beach Rescue Soul",
    badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  {
    id: "luna",
    name: "Luna",
    role: "Street Indie Pup",
    status: "Fostered & Safe",
    location: "Indiranagar, Bengaluru",
    quote: "Spotted during heavy rains. AI priority alert triggered instant community foster care.",
    image: "https://images.unsplash.com/photo-1655108624627-2802306434d8?auto=format&fit=crop&q=80&w=800",
    tag: "Rain Rescue Pup",
    badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  {
    id: "rocky",
    name: "Rocky",
    role: "Desi Hound",
    status: "Community Guardian",
    location: "Banjara Hills, Hyderabad",
    quote: "A gentle street soul who receives daily meals and medical checkups from BOW volunteers.",
    image: "https://images.unsplash.com/photo-1632090841068-41088be12ce9?auto=format&fit=crop&q=80&w=800",
    tag: "Daily Fed Soul",
    badgeColor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  {
    id: "bella",
    name: "Bella",
    role: "Desi Pariah",
    status: "Adopted Forever",
    location: "Kothrud, Pune",
    quote: "Transitioned from a busy market corner to a loving forever family in Pune.",
    image: "https://images.unsplash.com/photo-1659292692984-4787c010746f?auto=format&fit=crop&q=80&w=800",
    tag: "Forever Home",
    badgeColor: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  },
  {
    id: "bruno",
    name: "Bruno",
    role: "Community Indie",
    status: "Medical Care Complete",
    location: "Bandra, Mumbai",
    quote: "Treated for a severe leg wound. Now running happily with his street pack.",
    image: "https://images.unsplash.com/photo-1633512227626-a1f547fc6de3?auto=format&fit=crop&q=80&w=800",
    tag: "Healed & Free",
    badgeColor: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  },
  {
    id: "coco",
    name: "Coco",
    role: "Street Pup",
    status: "Ready for Adoption",
    location: "Hauz Khas, Delhi",
    quote: "Spotted as a 2-month-old orphan. Now playful, de-wormed, and eager to meet adopters.",
    image: "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&q=80&w=800",
    tag: "Puppy Soul",
    badgeColor: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  },
];

function About() {
  const getSystemStats = useServerFn(getSystemStatsServerFn);
  const [activeDogIndex, setActiveDogIndex] = useState(0);
  const activeDog = heroDogFaces[activeDogIndex];
  const [stats, setStats] = useState({
    casesRescued: "4",
    mealsProvided: "48",
    activeGuardians: "12",
  });

  useEffect(() => {
    async function loadRealStats() {
      try {
        const live = await getSystemStats();
        if (live) {
          setStats({
            casesRescued: live.casesRescued,
            mealsProvided: live.mealsProvided,
            activeGuardians: live.activeGuardians,
          });
        }
      } catch (err) {
        console.warn("Failed to load live stats:", err);
      }
    }
    loadRealStats();
  }, []);

  const steps = [
    {
      title: "See",
      text: "Notice the street souls who are too often overlooked.",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600",
      tag: "Observation",
    },
    {
      title: "Report",
      text: "Share a clear, useful signal with people who can help.",
      image: "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=600",
      tag: "Geo-Location",
    },
    {
      title: "Understand",
      text: "Use AI-assisted observations to make the next step clearer.",
      image: "https://images.unsplash.com/photo-1632090841068-41088be12ce9?auto=format&fit=crop&q=80&w=600",
      tag: "AI Analysis",
    },
    {
      title: "Respond",
      text: "Help rescue teams prioritize human attention.",
      image: "https://images.unsplash.com/photo-1633512227626-a1f547fc6de3?auto=format&fit=crop&q=80&w=600",
      tag: "Team Dispatch",
    },
    {
      title: "Support",
      text: "Feed, share, volunteer, and stay with the story.",
      image: "https://images.unsplash.com/photo-1655108624627-2802306434d8?auto=format&fit=crop&q=80&w=600",
      tag: "Meal & Care",
    },
    {
      title: "Adopt",
      text: "Open a door to a forever home when the time is right.",
      image: "https://images.unsplash.com/photo-1659292692984-4787c010746f?auto=format&fit=crop&q=80&w=600",
      tag: "Forever Home",
    },
  ];

  const beliefs = [
    {
      Icon: Eye,
      title: "Every observation deserves context",
      text: "AI enhances human reports with breed details, health indicators, and location urgency.",
      image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=400",
      dog: "Simba in Panjim",
    },
    {
      Icon: ShieldCheck,
      title: "Every AI result is clearly labeled",
      text: "We keep humans at the decision point — technology supports, rescuers decide.",
      image: "https://images.unsplash.com/photo-1768386629359-806f0fe996dc?auto=format&fit=crop&q=80&w=400",
      dog: "Milo in Chennai",
    },
    {
      Icon: Users,
      title: "Every action is stronger together",
      text: "Connecting feeders, vets, rescuers, and community members in a unified network.",
      image: "https://images.unsplash.com/photo-1633512227626-a1f547fc6de3?auto=format&fit=crop&q=80&w=400",
      dog: "Bruno in Mumbai",
    },
    {
      Icon: Heart,
      title: "Every street soul deserves dignity",
      text: "No street dog is invisible. Every life matters, from street feeding to forever adoption.",
      image: "https://images.unsplash.com/photo-1659292692984-4787c010746f?auto=format&fit=crop&q=80&w=400",
      dog: "Bella in Pune",
    },
  ];

  return (
    <main>
      {/* Dynamic Hero Section with Dog Faces */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-bow-ivory via-bow-sand/30 to-bow-ivory px-5 pb-16 pt-12 sm:px-10 sm:pb-24 sm:pt-20">
        {/* Floating background paw watermark graphics */}
        <div className="pointer-events-none absolute -left-10 top-10 opacity-5">
          <PawPrint className="h-64 w-64 text-bow-brown" />
        </div>
        <div className="pointer-events-none absolute -right-10 bottom-10 opacity-5">
          <PawPrint className="h-72 w-72 text-bow-brown" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Content Column */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-bow-brown/20 bg-bow-paper px-3.5 py-1.5 shadow-sm">
                <PawPrint className="h-4 w-4 animate-bounce text-bow-brown" />
                <span className="eyebrow text-bow-brown">Why BOW Exists</span>
              </div>

              <h1 className="mt-5 font-display text-4xl leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                Street dogs often remain <span className="italic text-bow-brown">invisible</span> until someone notices.
              </h1>

              <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
                BOW is a technology platform for the moments when a person chooses to stop, look closer, and help. We make compassion easier to coordinate without taking humanity out of the process.
              </p>

              {/* Interactive Dog Avatars Selection Bar */}
              <div className="mt-8 rounded-2xl border border-bow-brown/15 bg-bow-paper/90 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-bow-gold" />
                    Meet Street Souls Protected By BOW:
                  </span>
                  <span className="text-[0.65rem] text-bow-brown font-medium">Click a face 🐾</span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto pb-1 pt-1">
                  {heroDogFaces.map((dog, idx) => {
                    const isSelected = idx === activeDogIndex;
                    return (
                      <button
                        key={dog.id}
                        onClick={() => setActiveDogIndex(idx)}
                        className={`group relative flex flex-col items-center gap-1 transition-all duration-300 focus:outline-none ${
                          isSelected ? "scale-110" : "opacity-70 hover:opacity-100 hover:scale-105"
                        }`}
                      >
                        <div
                          className={`relative h-13 w-13 rounded-full overflow-hidden border-2 transition-all shadow-md ${
                            isSelected
                              ? "border-bow-brown ring-4 ring-bow-brown/20"
                              : "border-border group-hover:border-bow-brown/50"
                          }`}
                        >
                          <img
                            src={dog.image}
                            alt={dog.name}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                        </div>
                        <span
                          className={`text-[0.7rem] font-medium leading-none ${
                            isSelected ? "font-bold text-bow-brown" : "text-muted-foreground"
                          }`}
                        >
                          {dog.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons & Quick Stats */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ActionLink to="/report" className="h-13 px-6 text-sm font-semibold shadow-md">
                  Spot & Report a Soul
                </ActionLink>
                <Link
                  to="/rescue"
                  className="inline-flex h-13 items-center gap-2 rounded-lg border border-border bg-bow-paper px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-bow-sand/40"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  View Live Rescue Feed
                </Link>
              </div>

              {/* Impact stats pill */}
              <div className="mt-8 flex items-center gap-6 border-t border-border/60 pt-6">
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">{stats.casesRescued}</p>
                  <p className="text-xs text-muted-foreground">Cases Rescued</p>
                </div>
                <div className="h-8 w-px bg-border/80" />
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">{stats.mealsProvided}</p>
                  <p className="text-xs text-muted-foreground">Meals Distributed</p>
                </div>
                <div className="h-8 w-px bg-border/80" />
                <div>
                  <p className="font-display text-2xl font-semibold text-foreground">{stats.activeGuardians}</p>
                  <p className="text-xs text-muted-foreground">Active Guardians</p>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Dog Face Hero Spotlight Card */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-bow-brown/20 via-bow-gold/20 to-emerald-500/10 blur-2xl opacity-70" />

                <div className="relative overflow-hidden rounded-2xl border border-border bg-bow-paper shadow-2xl transition-all duration-500">
                  {/* Top Image Spotlight with Dog Face */}
                  <div className="relative h-72 sm:h-96 overflow-hidden bg-muted">
                    <img
                      key={activeDog.image}
                      src={activeDog.image}
                      alt={activeDog.name}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top status chips */}
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md bg-white/90 shadow-sm ${activeDog.badgeColor}`}>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        {activeDog.status}
                      </span>
                    </div>

                    <div className="absolute right-4 top-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/20">
                        <Sparkles className="h-3.5 w-3.5 text-bow-gold" />
                        {activeDog.tag}
                      </span>
                    </div>

                    {/* Bottom Dog Details Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-3xl text-white">{activeDog.name}</h3>
                            <BadgeCheck className="h-5 w-5 text-bow-gold" />
                          </div>
                          <p className="text-xs font-medium text-white/80 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-red-400" />
                            {activeDog.location} • <span className="text-bow-gold">{activeDog.role}</span>
                          </p>
                        </div>
                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wider uppercase backdrop-blur-md text-white border border-white/20">
                          Verified Soul
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Quote */}
                  <div className="p-6">
                    <div className="relative rounded-xl bg-bow-sand/50 p-4 border border-bow-brown/10">
                      <Quote className="absolute right-3 top-3 h-5 w-5 text-bow-brown/20" />
                      <p className="text-xs italic leading-relaxed text-foreground/90 sm:text-sm">
                        "{activeDog.quote}"
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 overflow-hidden">
                          {heroDogFaces.slice(0, 4).map((d) => (
                            <img
                              key={d.id}
                              src={d.image}
                              alt={d.name}
                              className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          Protected by <strong>BOW Network</strong>
                        </span>
                      </div>

                      <Link
                        to="/adopt"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-bow-brown hover:underline"
                      >
                        Meet {activeDog.name} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Decorative Chip */}
                <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-3 rounded-xl border border-border bg-bow-paper p-3 shadow-xl backdrop-blur-md">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Heart className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Every Street Soul Matters</p>
                    <p className="text-[0.68rem] text-muted-foreground">24/7 AI Signal & Rescue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faces of BOW Street Souls Grid Showcase */}
      <section className="px-5 py-16 sm:px-10 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="The Souls Behind Our Mission"
            title="Faces of Indian Street Dogs Protected by BOW."
            body="Behind every report is a living soul with a story. Here are some of the street dogs transformed through community action and AI-assisted care."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {heroDogFaces.map((dog) => (
              <div
                key={dog.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-bow-paper transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 w-full overflow-hidden bg-muted">
                  <img
                    src={dog.image}
                    alt={dog.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[0.7rem] font-semibold text-white backdrop-blur-md border border-white/20">
                    {dog.tag}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-display text-2xl text-white">{dog.name}</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-bow-gold" />
                      {dog.location}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold ${dog.badgeColor}`}>
                    {dog.status}
                  </span>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    "{dog.quote}"
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="text-[0.7rem] font-medium text-bow-brown">{dog.role}</span>
                    <Link
                      to="/community"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-bow-brown"
                    >
                      View Story <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section with Dog Face Thumbnails */}
      <section className="px-5 py-16 sm:px-10 sm:py-24 bg-bow-ivory border-t border-border">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Our process"
            title="Technology should bring people closer to care."
            body="We use technology to turn compassion into coordinated action — with rescue professionals, veterinarians, community members, and adopters at the center."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group overflow-hidden rounded-2xl border border-border bg-bow-paper transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-bow-brown/90 px-3 py-1 font-display text-xs font-medium text-white shadow-sm">
                    0{index + 1}
                  </span>
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider uppercase text-bow-brown shadow-sm">
                    {step.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl text-foreground">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beliefs Section with Dog Portrait Pairings */}
      <section className="bg-bow-forest px-5 py-20 text-primary-foreground sm:px-10 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] items-center">
            <div>
              <p className="eyebrow text-bow-gold">What we believe</p>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl leading-none">
                AI assists.
                <br />
                People decide.
                <br />
                Care continues.
              </h2>
              <p className="mt-6 text-sm leading-6 text-primary-foreground/75 max-w-md">
                BOW was built around the principle that technology should empower human compassion, not replace it. Every algorithm serves the rescuers, feeders, and community guardians on the ground.
              </p>
              <div className="mt-8">
                <ActionLink to="/report" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Report a Street Dog in Need
                </ActionLink>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {beliefs.map(({ Icon, title, text, image, dog }) => (
                <div
                  key={title}
                  className="rounded-xl border border-primary-foreground/15 bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={image}
                      alt={dog}
                      className="h-12 w-12 rounded-full object-cover border-2 border-bow-gold/50 shadow-md"
                    />
                    <div>
                      <Icon className="h-4 w-4 text-bow-gold" />
                      <span className="text-[0.68rem] text-bow-gold font-medium uppercase tracking-wider block mt-0.5">
                        {dog}
                      </span>
                    </div>
                  </div>
                  <h4 className="mt-4 font-display text-lg text-white leading-snug">{title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-primary-foreground/70">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action with Dog Face Stack */}
      <section className="px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 rounded-2xl border border-border bg-bow-sand/50 p-8 sm:p-12 md:flex-row md:items-center md:justify-between shadow-sm">
          <div className="max-w-2xl">
            <div className="flex -space-x-3 overflow-hidden mb-4">
              {heroDogFaces.map((dog) => (
                <img
                  key={dog.id}
                  src={dog.image}
                  alt={dog.name}
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover shadow-sm"
                />
              ))}
            </div>
            <p className="font-display text-3xl sm:text-4xl text-foreground">Ready to notice differently?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start with one report, one story, or one meal. Join thousands of community guardians protecting street dogs across India.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <ActionLink to="/report" className="h-12 px-6">
              Spot a Dog & Report
            </ActionLink>
            <Link
              to="/adopt"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-bow-paper px-5 text-sm font-medium text-foreground hover:bg-bow-sand/60"
            >
              Adopt a Street Soul
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

