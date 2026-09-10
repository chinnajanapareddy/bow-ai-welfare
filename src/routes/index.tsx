import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Heart,
  PawPrint,
  Sparkles,
} from "@/components/bow-icons";
import {
  ActionLink,
  AnalysisResult,
  BowCard,
  DogCard,
  ReportForm,
  SectionHeading,
} from "@/components/bow-ui";
import { dogs, impactMetrics, services, stories } from "@/lib/bow-data";
import { FloatingPaws, FoodBowl, SwayingBone } from "@/components/bow-pet-animations";
import heroImage from "@/assets/bow-hero.jpg";
import feedingImage from "@/assets/bow-feeding-card.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BOW — Every Street Soul Deserves a Second Chance" },
      {
        name: "description",
        content:
          "A premium platform for reporting, rescuing, feeding, supporting, and adopting street dogs.",
      },
      { property: "og:title", content: "BOW — Every Street Soul Deserves a Second Chance" },
      {
        property: "og:description",
        content: "Technology that turns compassion into meaningful action for every street soul.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <section className="relative min-h-[680px] overflow-hidden border-b border-border bg-bow-forest text-primary-foreground sm:min-h-[720px]">
        <FloatingPaws />
        <img
          src={heroImage}
          alt="A gentle street dog resting on a quiet city lane"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bow-forest/95 via-bow-forest/65 to-transparent" />
        <div className="relative mx-auto flex min-h-[680px] max-w-[1400px] items-end px-5 pb-20 pt-24 sm:min-h-[720px] sm:px-10 sm:pb-28">
          <div className="max-w-2xl reveal">
            <p className="eyebrow text-bow-gold">BOW · For every street soul</p>
            <h1 className="mt-5 max-w-xl font-display text-6xl leading-[0.9] tracking-[-0.05em] sm:text-8xl">
              Every <em className="text-bow-gold">Street Soul</em>
              <br />
              Deserves a Second Chance.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/75 sm:text-lg">
              Technology that turns compassion into meaningful action.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionLink to="/report" className="bg-bow-forest text-primary-foreground hover:bg-bow-forest/90 border border-bow-sand/20 shadow-md">
                Report a Dog
              </ActionLink>
              <ActionLink to="/community" variant="outline" className="bg-bow-paper/95 text-bow-forest hover:bg-white hover:text-bow-forest border border-bow-sand/40 font-bold shadow-md">
                Explore Stories
              </ActionLink>
            </div>
          </div>
          <div className="absolute bottom-8 right-5 hidden max-w-[180px] text-right font-display text-3xl italic leading-[0.9] text-primary-foreground/90 sm:block">
            Small actions
            <br />
            big change <span className="text-bow-gold">♡</span>
          </div>
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-8 max-w-6xl px-5 sm:-mt-10 sm:px-10">
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-primary-foreground/30 bg-bow-paper/90 shadow-xl backdrop-blur-xl sm:grid-cols-4">
          {impactMetrics.map((metric) => (
            <div
              key={metric.label}
              className="border-b border-border px-4 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <p className="font-display text-3xl text-bow-forest sm:text-4xl">{metric.value}</p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <section className="px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="A connected way to care"
            title="See. Understand. Respond."
            body="BOW brings the right people, context, and care together — from the first report to a forever home."
          />
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
            {services.map((service) => {
              const Icon = ({ className }: { className?: string }) => (
                <span className={className}>
                  {service.icon === "megaphone"
                    ? "↗"
                    : service.icon === "scan"
                      ? "✦"
                      : service.icon === "ambulance"
                        ? "＋"
                        : service.icon === "bowl"
                          ? "◒"
                          : service.icon === "home"
                            ? "⌂"
                            : "●"}
                </span>
              );
              return (
                <Link
                  to={service.href}
                  key={service.title}
                  className="group bg-bow-paper p-5 transition-colors hover:bg-bow-forest hover:text-primary-foreground sm:p-6"
                >
                  <Icon className="text-2xl text-bow-brown transition-colors group-hover:text-bow-gold" />
                  <h3 className="mt-8 text-sm font-semibold">{service.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground group-hover:text-primary-foreground/70">
                    {service.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="grain border-y border-border bg-bow-sand/35 px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Report a street soul"
              title="One moment of noticing can change everything."
              body="Share what you see and BOW helps turn a concerned citizen's observation into a clear next step for a human rescue team."
            />
            <div className="mt-8">
              <ActionLink to="/report">Start a report</ActionLink>
            </div>
          </div>
          <ReportForm />
        </div>
      </section>
      <section className="px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">Human-first intelligence</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.95] tracking-[-0.04em]">
              A clearer picture
              <br />
              for better care.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
              BOW AI highlights visible welfare indicators to help coordinators focus attention. It
              does not diagnose.
            </p>
            <div className="mt-7 flex items-center gap-3 text-xs text-muted-foreground">
              <BadgeCheck className="h-5 w-5 text-bow-forest" /> Human review stays at the center
            </div>
          </div>
          <AnalysisResult />
        </div>
      </section>
      <section className="bg-bow-forest px-5 py-20 text-primary-foreground sm:px-10 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Stories of support"
            title="Real stories. Happier tomorrows."
            body="Small actions become visible change when a community chooses to stay involved."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {stories.map((story, index) => (
              <BowCard
                key={story.title}
                className="overflow-hidden bg-primary-foreground/10 text-primary-foreground"
              >
                <div className="grid grid-cols-[0.8fr_1.2fr] gap-0">
                  <img
                    src={index === 0 ? heroImage : feedingImage}
                    alt={story.title}
                    width={900}
                    height={1000}
                    className="h-full min-h-64 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-col justify-between p-5 sm:p-7">
                    <div>
                      <span className="text-[0.62rem] uppercase tracking-[0.16em] text-bow-gold">
                        {story.type}
                      </span>
                      <h3 className="mt-3 font-display text-3xl leading-none">{story.title}</h3>
                      <p className="mt-5 font-display text-lg italic text-primary-foreground/75">
                        “{story.quote}”
                      </p>
                    </div>
                    <div className="mt-8 flex items-center justify-between border-t border-primary-foreground/15 pt-4 text-xs text-primary-foreground/65">
                      <span>
                        <Heart className="mr-1 inline h-3.5 w-3.5 text-bow-gold" />{" "}
                        {story.supporters} supporters
                      </span>
                      <span>{story.comments} comments</span>
                    </div>
                  </div>
                </div>
              </BowCard>
            ))}
          </div>
          <div className="mt-8">
            <ActionLink to="/community" variant="outline">
              Read the community stories
            </ActionLink>
          </div>
        </div>
      </section>
      <section className="px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="eyebrow">A birthday gift with four legs</p>
              <h2 className="mt-3 max-w-xl font-display text-5xl leading-[0.95] tracking-[-0.04em]">
                Celebrate a little differently.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
                Feed a neighborhood, share a moment, and turn your happiest day into hope for a
                street soul.
              </p>
              <div className="mt-7">
                <ActionLink to="/donate">Start a feeding drive</ActionLink>
              </div>
              <FoodBowl className="mt-12 hidden sm:block" />
            </div>
            <img
              src={feedingImage}
              alt="A street dog being fed with care"
              width={900}
              height={1000}
              className="h-72 w-full rounded-xl object-cover sm:h-96"
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section className="border-t border-border bg-bow-paper px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Find your companion"
            title="A forever home starts with a good match."
            body="Meet the dogs who are ready to be known for more than where they began."
            action={
              <ActionLink to="/adopt" variant="outline">
                View all dogs
              </ActionLink>
            }
          />
          <SwayingBone className="mt-6" />
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {dogs.map((dog, index) => (
              <DogCard key={dog.name} {...dog} index={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
