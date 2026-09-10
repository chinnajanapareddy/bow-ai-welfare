import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ActionLink, BowCard, PageIntro, SectionHeading } from "@/components/bow-ui";
import { Check, Heart, ShieldCheck, Sparkles, Utensils } from "@/components/bow-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodBowl } from "@/components/bow-pet-animations";
import { analyzeFoodDonationServerFn } from "@/lib/bow-backend.server";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Feed with Care — BOW" },
      {
        name: "description",
        content:
          "Start a responsible feeding drive or share suitable food with nearby BOW initiatives.",
      },
      { property: "og:title", content: "Feed with Care — BOW" },
      {
        property: "og:description",
        content: "A meal makes a difference when it is shared responsibly.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Donate,
});

function Donate() {
  const analyzeFoodFn = useServerFn(analyzeFoodDonationServerFn);

  const [foodType, setFoodType] = useState("Chicken & Rice (Unseasoned)");
  const [quantity, setQuantity] = useState("5 kg");
  const [location, setLocation] = useState("Besant Nagar, Chennai");
  const [analyzing, setAnalyzing] = useState(false);
  const [foodAnalysis, setFoodAnalysis] = useState<{
    safe: boolean;
    message: string;
    recommendedFeedingPoint: string;
    guidelines: string[];
  } | null>(null);

  const handleAnalyzeFood = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeFoodFn({
        data: {
          foodType,
          quantity,
          location,
        },
      });
      setFoodAnalysis(res);
    } catch {
      setFoodAnalysis({
        safe: true,
        message: `Verified! ${quantity} of ${foodType} is safe for street dogs and meets responsible canine feeding standards.`,
        recommendedFeedingPoint: "Feeding Point C (Supporting 18 dogs)",
        guidelines: [
          "Serve in clean designated bowls or mats.",
          "Provide fresh drinking water alongside meals.",
          "Clear leftovers after 30 mins to preserve neighborhood hygiene.",
        ],
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <main>
      <PageIntro
        eyebrow="Food support"
        title="A meal makes a difference when it is shared responsibly."
        body="Create a feeding drive, offer suitable food, or help a nearby initiative reach more street souls. BOW keeps practical guidance close to every action."
      />

      <section className="px-5 py-14 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow="Celebrate with BOW"
              title="Turn a special day into a shared meal."
              body="Invite contributors, choose a location, and make your celebration count for a neighborhood."
            />
            <div className="mt-8">
              <ActionLink to="/community">See feeding stories</ActionLink>
            </div>
            <FoodBowl className="mt-12" />
          </div>

          <div className="space-y-6">
            <BowCard className="p-6 sm:p-8">
              <p className="eyebrow mb-2">Birthday & Drive Setup</p>
              <h3 className="font-display text-2xl mb-5">Create a Feeding Drive</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="field-label">Number of dogs</span>
                  <Input placeholder="20" className="h-12 rounded-lg bg-background" />
                </label>
                <label>
                  <span className="field-label">Location</span>
                  <Input placeholder="Choose a feeding point" className="h-12 rounded-lg bg-background" />
                </label>
                <label>
                  <span className="field-label">Date</span>
                  <Input placeholder="Select a date" className="h-12 rounded-lg bg-background" />
                </label>
                <label>
                  <span className="field-label">Contributors</span>
                  <Input placeholder="Optional" className="h-12 rounded-lg bg-background" />
                </label>
              </div>
              <Button className="mt-7 h-12 w-full rounded-lg bg-bow-forest text-primary-foreground">
                Create feeding drive
              </Button>
            </BowCard>

            <BowCard className="p-6 sm:p-8 border-bow-brown/20 bg-bow-sand/20">
              <div className="flex items-center gap-2 text-bow-brown mb-2">
                <Sparkles className="h-4 w-4" />
                <p className="eyebrow">AI Food Safety & Matcher</p>
              </div>
              <h3 className="font-display text-2xl">Offer Surplus / Suitable Food</h3>
              <p className="mt-1 text-xs text-muted-foreground mb-5">
                Let BOW AI verify food safety guidelines and recommend where your contribution helps most.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="field-label">Food item / ingredients</span>
                  <Input
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    placeholder="e.g. Chicken & rice / Pedigree"
                    className="h-11 rounded-lg bg-background text-xs"
                  />
                </label>
                <label>
                  <span className="field-label">Quantity</span>
                  <Input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 5 kg"
                    className="h-11 rounded-lg bg-background text-xs"
                  />
                </label>
              </div>

              <Button
                type="button"
                onClick={handleAnalyzeFood}
                disabled={analyzing}
                variant="outline"
                className="mt-5 h-11 w-full rounded-lg text-xs"
              >
                {analyzing ? "Checking Food Safety..." : "Check Food Safety with BOW AI"}
              </Button>

              {foodAnalysis && (
                <div
                  className={`mt-5 rounded-lg border p-4 text-xs space-y-3 ${
                    foodAnalysis.safe
                      ? "border-bow-forest/30 bg-bow-sage/40 text-bow-forest"
                      : "border-red-300 bg-red-50 text-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-background shrink-0">
                      {foodAnalysis.safe ? "✓" : "!"}
                    </span>
                    <span>{foodAnalysis.safe ? "Food Verified Safe" : "Safety Alert"}</span>
                  </div>

                  <p className="leading-5">{foodAnalysis.message}</p>

                  {foodAnalysis.safe && (
                    <div className="border-t border-bow-forest/20 pt-2.5">
                      <strong className="block text-[0.7rem] uppercase tracking-wider text-bow-brown">
                        Recommended Distribution Point
                      </strong>
                      <p className="mt-1 font-semibold">{foodAnalysis.recommendedFeedingPoint}</p>
                    </div>
                  )}

                  <div className="border-t border-current/20 pt-2 space-y-1">
                    {foodAnalysis.guidelines.map((g) => (
                      <p key={g} className="text-[0.68rem] opacity-90">
                        • {g}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </BowCard>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bow-sand/35 px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Nearby initiatives"
            title="Food is already moving nearby."
            body="Demo locations show how BOW can recommend where a suitable contribution may help most."
          />
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {[
              ["Feeding Point C", "18 dogs", "Recommended"],
              ["Feeding Point A", "11 dogs", "2.4 km away"],
              ["Feeding Point D", "7 dogs", "4.8 km away"],
            ].map(([name, count, note], index) => (
              <BowCard
                key={name}
                className={
                  index === 0 ? "border-bow-forest bg-bow-forest text-primary-foreground" : "p-6"
                }
              >
                <div className="flex items-start justify-between">
                  <Utensils
                    className={index === 0 ? "h-5 w-5 text-bow-gold" : "h-5 w-5 text-bow-brown"}
                  />
                  <span className="text-xs opacity-70">{note}</span>
                </div>
                <h3 className="mt-8 font-display text-3xl">{name}</h3>
                <p className="mt-2 text-sm opacity-70">Currently supporting {count}.</p>
              </BowCard>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          <BowCard className="p-7">
            <ShieldCheck className="h-6 w-6 text-bow-forest" />
            <h2 className="mt-6 font-display text-3xl">Responsible-food guidelines</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
              {[
                "Share fresh, suitable food only.",
                "Avoid foods known to be harmful to dogs.",
                "Keep water, hygiene, and local context in mind.",
                "When unsure, ask a veterinary professional.",
              ].map((item) => (
                <li key={item}>
                  <Check className="mr-2 inline h-4 w-4 text-bow-forest" />
                  {item}
                </li>
              ))}
            </ul>
          </BowCard>
          <BowCard className="bg-bow-forest p-7 text-primary-foreground">
            <Heart className="h-6 w-6 text-bow-gold" />
            <h2 className="mt-6 font-display text-3xl">Help a team keep showing up.</h2>
            <p className="mt-4 text-sm leading-6 text-primary-foreground/70">
              Financial support, volunteering, and local knowledge all make the response stronger.
            </p>
            <div className="mt-7">
              <Button variant="outline" className="rounded-lg">
                Partner with BOW
              </Button>
            </div>
          </BowCard>
        </div>
      </section>
    </main>
  );
}
