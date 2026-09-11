import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ReportForm, AnalysisResult } from "@/components/bow-ui";
import heroImage from "@/assets/bow-hero.jpg";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report a Street Soul — BOW" },
      {
        name: "description",
        content: "Share a street-dog welfare concern with BOW's human-first reporting flow.",
      },
      { property: "og:title", content: "Report a Street Soul — BOW" },
      {
        property: "og:description",
        content: "Share what you see and connect it with the right help.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Report,
});

function Report() {
  const [analysis, setAnalysis] = useState<{
    priority: "High" | "Medium" | "Low";
    summary: string;
    recommendedAction: string;
    confidence?: number;
    indicators?: string[];
    whyPriority?: string;
    immediateActions?: string[];
  } | null>(null);

  return (
    <main className="min-h-screen bg-bow-ivory pt-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-start">

          {/* ── LEFT: Editorial storytelling ── */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bow-brown mb-4">
                Report a street soul
              </p>
              <h1 className="font-display text-5xl sm:text-6xl leading-[0.93] tracking-[-0.04em] text-foreground">
                One moment of
                <br />
                noticing can
                <br />
                <em className="text-bow-forest not-italic">change everything.</em>
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
                Share what you see and BOW helps turn a concerned citizen's observation
                into a clear next step for a human rescue team.
              </p>
            </div>

            {/* Hero image */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3] lg:aspect-[3/2]">
              <img
                src={heroImage}
                alt="A gentle street dog resting on a quiet city lane"
                className="h-full w-full object-cover object-[62%_center]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bow-forest/65 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display text-2xl italic text-white/90 leading-tight">
                  A kinder tomorrow,
                  <br />
                  together <span className="text-bow-gold">♡</span>
                </p>
              </div>
            </div>

            {/* Impact pillars */}
            <div className="flex flex-wrap gap-6">
              {[
                { emoji: "🐾", title: "Animals Matter", sub: "Every life counts" },
                { emoji: "🤝", title: "People Care", sub: "Community in action" },
                { emoji: "🛡️", title: "Safer Communities", sub: "Streets for all beings" },
              ].map(({ emoji, title, sub }) => (
                <div key={title} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-bow-sand text-base">
                    {emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{title}</p>
                    <p className="text-[0.7rem] text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Report form + AI result ── */}
          <div className="flex flex-col gap-6">
            <ReportForm onResult={setAnalysis} />
            {analysis && <AnalysisResult analysis={analysis} />}
          </div>

        </div>
      </div>
    </main>
  );
}
