import { createFileRoute } from "@tanstack/react-router";
import { ActionLink, BowCard, PageIntro, SectionHeading } from "@/components/bow-ui";
import { ArrowRight, Heart, MessageCircle, Quote, ShieldCheck } from "@/components/bow-icons";
import heroImage from "@/assets/bow-hero.jpg";
import feedingImage from "@/assets/bow-feeding-card.jpg";
import storyImage from "@/assets/bow-story-card.jpg";
export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Stories — BOW" },
      {
        name: "description",
        content:
          "Rescue stories, feeding drives, recovery moments, and community support from BOW.",
      },
      { property: "og:title", content: "Community Stories — BOW" },
      { property: "og:description", content: "Small actions become visible change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});
function Community() {
  const posts = [
    {
      label: "Rescue story",
      title: "Bruno's Second Chance",
      quote: "From pain on the streets to a life full of love.",
      image: heroImage,
    },
    {
      label: "Birthday feeding",
      title: "A birthday gift that had four legs",
      quote: "20 meals, one neighborhood, and a new tradition.",
      image: feedingImage,
    },
    {
      label: "Recovery",
      title: "Visible changes, shared carefully",
      quote: "Day 1 to Day 21 — a community stayed with her.",
      image: storyImage,
    },
  ];
  return (
    <main>
      <PageIntro
        eyebrow="The BOW community"
        title="Stories that keep compassion moving."
        body="A premium editorial space for the people, teams, and street souls who make small actions count."
      />
      <section className="px-5 py-14 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap gap-2">
            <span className="rounded-full bg-bow-forest px-4 py-2 text-xs text-primary-foreground">
              All stories
            </span>
            {["Rescue stories", "Before & after", "Food support", "Adoption"].map((tag) => (
              <button
                type="button"
                key={tag}
                className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-bow-sand"
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BowCard key={post.title} className="group overflow-hidden p-0">
                <img
                  src={post.image}
                  alt={post.title}
                  width={900}
                  height={1000}
                  className="aspect-[1.1] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="p-6">
                  <p className="eyebrow">{post.label}</p>
                  <h2 className="mt-3 font-display text-3xl leading-none">{post.title}</h2>
                  <p className="mt-4 font-display text-lg italic text-muted-foreground">
                    “{post.quote}”
                  </p>
                  <div className="mt-7 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>
                      <Heart className="mr-1 inline h-3.5 w-3.5 text-bow-brown" />
                      142 supporters
                    </span>
                    <span>
                      <MessageCircle className="mr-1 inline h-3.5 w-3.5" />
                      18
                    </span>
                  </div>
                </div>
              </BowCard>
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-border bg-bow-sand/35 px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Before / after recovery"
            title="Follow the visible changes."
            body="A case can hold follow-up images so communities see the journey. We describe what is visible, never claim a medical recovery from AI alone."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Day 1", "High priority", "Possible wound"],
              ["Day 7", "Follow-up", "Care continuing"],
              ["Day 21", "Improved appearance", "Visible changes observed"],
            ].map(([day, status, note], index) => (
              <BowCard key={day} className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl">{day}</span>
                  <span className="text-xs text-bow-brown">0{index + 1}</span>
                </div>
                <div className="mt-8 h-2 rounded-full bg-bow-sand">
                  <div
                    className="h-full rounded-full bg-bow-forest"
                    style={{ width: `${(index + 1) * 33}%` }}
                  />
                </div>
                <p className="mt-5 text-sm font-semibold">{status}</p>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              </BowCard>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <BowCard className="bg-bow-forest p-8 text-primary-foreground">
            <p className="eyebrow text-bow-gold">Celebrate with BOW</p>
            <h2 className="mt-4 font-display text-4xl">A birthday gift that had four legs.</h2>
            <p className="mt-4 text-sm leading-6 text-primary-foreground/70">
              Start a feeding drive, invite friends, and make an ordinary celebration meaningful.
            </p>
            <div className="mt-7">
              <ActionLink to="/donate">Start a feeding drive</ActionLink>
            </div>
          </BowCard>
          <BowCard className="p-8">
            <ShieldCheck className="h-6 w-6 text-bow-brown" />
            <h2 className="mt-6 font-display text-4xl">Share with care.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Community stories protect dignity, respect privacy, and make clear what is verified,
              user-submitted, or AI-assisted.
            </p>
          </BowCard>
        </div>
      </section>
    </main>
  );
}
