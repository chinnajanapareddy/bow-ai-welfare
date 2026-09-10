import { createFileRoute } from "@tanstack/react-router";
import { ActionLink, BowCard, PageIntro, SectionHeading } from "@/components/bow-ui";
import { ArrowRight, Check, Eye, Heart, ShieldCheck, Users } from "@/components/bow-icons";
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
function About() {
  const steps = [
    ["See", "Notice the street souls who are too often overlooked."],
    ["Report", "Share a clear, useful signal with people who can help."],
    ["Understand", "Use AI-assisted observations to make the next step clearer."],
    ["Respond", "Help rescue teams prioritize human attention."],
    ["Support", "Feed, share, volunteer, and stay with the story."],
    ["Adopt", "Open a door to a forever home when the time is right."],
  ];
  const beliefs = [
    { Icon: Eye, text: "Every observation deserves context." },
    { Icon: ShieldCheck, text: "Every AI result is clearly labeled." },
    { Icon: Users, text: "Every action is stronger together." },
    { Icon: Heart, text: "Every street soul deserves dignity." },
  ];
  return (
    <main>
      <PageIntro
        eyebrow="Why BOW exists"
        title="Street dogs often remain invisible until someone notices."
        body="BOW is a technology platform for the moments when a person chooses to stop, look closer, and help. We make compassion easier to coordinate without taking humanity out of the process."
      />
      <section className="px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Our mission"
            title="Technology should bring people closer to care."
            body="We use technology to turn compassion into coordinated action — with rescue professionals, veterinarians, community members, and adopters at the center."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            {steps.map(([title, text], index) => (
              <div key={title} className="bg-bow-paper p-7 sm:p-9">
                <span className="font-display text-5xl text-bow-brown/40">0{index + 1}</span>
                <h3 className="mt-8 font-display text-3xl">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-bow-forest px-5 py-20 text-primary-foreground sm:px-10 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="eyebrow text-bow-gold">What we believe</p>
              <h2 className="mt-4 font-display text-5xl leading-none">
                AI assists.
                <br />
                People decide.
                <br />
                Care continues.
              </h2>
            </div>
            <div className="grid gap-3">
              {beliefs.map(({ Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-4 border-b border-primary-foreground/15 py-4"
                >
                  <Icon className="h-5 w-5 text-bow-gold" />
                  <span className="text-sm text-primary-foreground/80">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-xl border border-border bg-bow-sand/40 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-4xl">Ready to notice differently?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start with one report, one story, or one meal.
            </p>
          </div>
          <ActionLink to="/report">Take the first step</ActionLink>
        </div>
      </section>
    </main>
  );
}
