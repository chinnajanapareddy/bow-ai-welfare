import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ActionLink,
  AnalysisResult,
  BowCard,
  PageIntro,
  ReportForm,
  SectionHeading,
} from "@/components/bow-ui";
import { ArrowRight, Check, Mic, ShieldCheck } from "@/components/bow-icons";
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

  const voiceSteps = [
    {
      Icon: Mic,
      title: "Press and speak",
      text: "“There is a dog near the college gate and it looks like it can't walk.”",
    },
    {
      Icon: ArrowRight,
      title: "Structured context",
      text: "Dog · Possible mobility issue · College Gate",
    },
    {
      Icon: ShieldCheck,
      title: "Human assessment",
      text: "Requires a coordinator or veterinary review",
    },
  ];
  return (
    <main>
      <PageIntro
        eyebrow="Report a street soul"
        title="Your voice can be the first step toward help."
        body="Share a photo, location, or natural-language voice note. BOW organizes the signal so a human can review it and decide what happens next."
      />
      <section className="px-5 py-14 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <ReportForm onResult={setAnalysis} />
          <AnalysisResult analysis={analysis} />
        </div>
      </section>
      <section className="border-y border-border bg-bow-paper px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="PawCare voice"
            title="Describe it naturally. We’ll help structure the signal."
            body="Speak in English, Telugu, Hindi, or Tamil. The prototype turns a voice note into structured context for a human coordinator."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {voiceSteps.map(({ Icon, title, text }) => (
              <BowCard key={title} className="p-6">
                <Icon className="h-5 w-5 text-bow-brown" />
                <h3 className="mt-6 font-display text-2xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
              </BowCard>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-4xl rounded-xl bg-bow-sage/55 p-7 sm:p-10">
          <div className="flex gap-4">
            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-bow-forest" />
            <div>
              <h3 className="font-display text-3xl">A clear line we never cross.</h3>
              <p className="mt-3 text-sm leading-6 text-bow-forest/80">
                BOW AI does not diagnose medical conditions. It can surface visible observations and
                urgency signals, but a rescue professional or veterinarian should make care
                decisions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
