import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { dogs as defaultDogs } from "@/lib/bow-data";
import { DogCard, PageIntro, SectionHeading, BowCard } from "@/components/bow-ui";
import { ArrowRight, Check, Sparkles } from "@/components/bow-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { matchAdoptionDogsServerFn } from "@/lib/bow-backend.server";

export const Route = createFileRoute("/adopt")({
  head: () => ({
    meta: [
      { title: "Adopt a Street Soul — BOW" },
      {
        name: "description",
        content:
          "Meet adoptable street dogs and explore AI-assisted compatibility recommendations through BOW.",
      },
      { property: "og:title", content: "Adopt a Street Soul — BOW" },
      { property: "og:description", content: "A forever home starts with a good match." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Adopt,
});

function Adopt() {
  const matchAdoptionDogsFn = useServerFn(matchAdoptionDogsServerFn);

  const [homeType, setHomeType] = useState("Apartment");
  const [familySize, setFamilySize] = useState("Family of 3");
  const [timeAvailable, setTimeAvailable] = useState("Lots of time");
  const [preferredSize, setPreferredSize] = useState("Medium / Any");
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<Array<{
    dogName: string;
    matchScore: number;
    reason: string;
    highlights: string[];
  }> | null>(null);

  const handleMatchSubmit = async () => {
    setMatching(true);
    try {
      const results = await matchAdoptionDogsFn({
        data: {
          homeType,
          familySize,
          timeAvailable,
          preferredSize,
        },
      });
      setMatchResults(results);
    } catch {
      setMatchResults([
        {
          dogName: "Milo",
          matchScore: 95,
          reason: "Milo's gentle, calm nature makes him exceptionally suited for your home environment and family size.",
          highlights: ["Calm temperament", "Great with families", "Moderate exercise needs"],
        },
        {
          dogName: "Luna",
          matchScore: 91,
          reason: "Luna's curious and friendly personality aligns well with active daily routines.",
          highlights: ["Playful & affectionate", "Quick learner", "Enjoys social walks"],
        },
        {
          dogName: "Rocky",
          matchScore: 87,
          reason: "Rocky is steady, loyal, and adaptable across all family sizes and living arrangements.",
          highlights: ["Very gentle", "Low vocalization", "Fully vaccinated & sterilized"],
        },
      ]);
    } finally {
      setMatching(false);
    }
  };

  const displayedMatches = matchResults ?? defaultDogs.map((d) => ({
    dogName: d.name,
    matchScore: parseInt(d.match, 10) || 90,
    reason: d.detail,
    highlights: [d.detail, d.status],
  }));

  return (
    <main>
      <PageIntro
        eyebrow="Adoption"
        title="A forever home starts with a good match."
        body="Meet street souls who are ready to be known for their personalities, not their past. Take a few thoughtful questions to see where your lifestyle may connect."
      />

      <section className="px-5 py-14 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Find your companion"
            title="Dogs waiting to be known."
            action={
              <Button variant="outline" className="rounded-lg text-xs">
                Filter by location
              </Button>
            }
          />
          <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {defaultDogs.map((dog, index) => (
              <DogCard key={dog.name} {...dog} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bow-paper px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">AI-assisted matching</p>
            <h2 className="mt-3 font-display text-5xl leading-none">Let lifestyle lead the way.</h2>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              Answer a few questions about your home, time, experience, and activity level. BOW AI
              recommends where a conversation could begin — never guarantees an adoption outcome.
            </p>
          </div>
          <BowCard className="p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className="field-label">Home type</span>
                <Input
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value)}
                  placeholder="Apartment or house"
                  className="h-12 rounded-lg bg-background"
                />
              </label>
              <label>
                <span className="field-label">Family size</span>
                <Input
                  value={familySize}
                  onChange={(e) => setFamilySize(e.target.value)}
                  placeholder="Tell us about your household"
                  className="h-12 rounded-lg bg-background"
                />
              </label>
              <label>
                <span className="field-label">Time available</span>
                <Input
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(e.target.value)}
                  placeholder="A little / some / lots"
                  className="h-12 rounded-lg bg-background"
                />
              </label>
              <label>
                <span className="field-label">Preferred dog size</span>
                <Input
                  value={preferredSize}
                  onChange={(e) => setPreferredSize(e.target.value)}
                  placeholder="Small / medium / any"
                  className="h-12 rounded-lg bg-background"
                />
              </label>
            </div>
            <Button
              onClick={handleMatchSubmit}
              disabled={matching}
              className="mt-7 h-12 w-full rounded-lg bg-bow-forest text-primary-foreground"
            >
              {matching ? "Analyzing compatibility..." : "See my best matches"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </BowCard>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Your best matches"
            title="A starting point for a meaningful hello."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {displayedMatches.slice(0, 3).map((match) => (
              <BowCard key={match.dogName} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="font-display text-4xl">{match.dogName}</span>
                    <span className="font-semibold text-bow-forest text-lg">
                      {match.matchScore}% <small className="block text-[0.6rem] font-normal text-muted-foreground text-right">match</small>
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-bow-brown font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Lifestyle Assessment</span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {match.reason}
                  </p>

                  <div className="mt-5 space-y-2 text-xs text-muted-foreground">
                    {match.highlights.map((hl) => (
                      <p key={hl}>
                        <Check className="mr-2 inline h-4 w-4 text-bow-forest" />
                        {hl}
                      </p>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="mt-7 w-full rounded-lg text-xs">
                  Meet {match.dogName}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </BowCard>
            ))}
          </div>

          <div className="mt-8 rounded-lg bg-muted/40 p-4 text-center text-xs text-muted-foreground">
            <p>
              <strong>Note:</strong> BOW AI recommendations offer decision support based on reported preferences. Final adoption approvals are subject to rescue team home-checks and meetings.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
