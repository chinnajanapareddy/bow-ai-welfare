import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeDogReport,
  askBowAi,
  matchAdoptionDogs,
  analyzeFoodDonation,
} from "./bow-ai.server.ts";

test("uses the Gemini API when GEMINI_API_KEY is configured", async () => {
  const fetchCalls: unknown[] = [];
  const originalFetch = globalThis.fetch;
  const originalGeminiKey = process.env["GEMINI_API_KEY"];

  process.env["GEMINI_API_KEY"] = "test-gemini-key";
  globalThis.fetch = (async (...args: unknown[]) => {
    fetchCalls.push(args);
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    priority: "High",
                    summary: "Dog is severely injured near College Gate.",
                    recommendedAction: "Dispatch emergency vet squad.",
                    confidence: 96,
                    indicators: ["Trauma detected", "Bleeding"],
                    whyPriority: "Severe trauma indicator",
                  }),
                },
              ],
            },
          },
        ],
      }),
      { headers: { "Content-Type": "application/json" } },
    ) as Response;
  }) as typeof fetch;

  try {
    const result = await analyzeDogReport({
      description: "Dog is severely injured.",
      concern: "Emergency",
      location: "College Gate",
    });

    assert.equal(fetchCalls.length, 1, "should call Gemini when GEMINI_API_KEY is configured");
    assert.equal(result.priority, "High");
    assert.equal(result.confidence, 96);
    assert.match(result.summary, /injured|severely/i);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalGeminiKey === undefined) {
      delete process.env["GEMINI_API_KEY"];
    } else {
      process.env["GEMINI_API_KEY"] = originalGeminiKey;
    }
  }
});

test("uses the OpenAI API when an API key is configured", async () => {
  const fetchCalls: unknown[] = [];
  const originalFetch = globalThis.fetch;
  const originalKey = process.env["OPENAI_API_KEY"];

  process.env["OPENAI_API_KEY"] = "test-key";
  process.env["GROQ_API_KEY"] = "";
  globalThis.fetch = (async (...args: unknown[]) => {
    fetchCalls.push(args);
    return new Response(
      JSON.stringify({
        output: [
          {
            content: [{ type: "text", text: "High priority: dog is bleeding and needs emergency rescue." }],
          },
        ],
      }),
      { headers: { "Content-Type": "application/json" } },
    ) as Response;
  }) as typeof fetch;

  try {
    const result = await analyzeDogReport({
      description: "A dog is bleeding and unable to walk.",
      concern: "Emergency",
      location: "Besant Nagar",
    });

    assert.equal(fetchCalls.length, 1, "should call OpenAI when the API key is configured");
    assert.equal(result.priority, "High");
    assert.match(result.summary, /bleeding|emergency|urgent/i);
    assert.equal(typeof result.confidence, "number");
    assert.ok(Array.isArray(result.indicators));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) {
      delete process.env["OPENAI_API_KEY"];
    } else {
      process.env["OPENAI_API_KEY"] = originalKey;
    }
  }
});

test("falls back to Groq when OpenAI is unavailable", async () => {
  const fetchCalls: unknown[] = [];
  const originalFetch = globalThis.fetch;
  const originalOpenAiKey = process.env["OPENAI_API_KEY"];
  const originalGroqKey = process.env["GROQ_API_KEY"];

  process.env["OPENAI_API_KEY"] = "";
  process.env["GROQ_API_KEY"] = "groq-test-key";
  globalThis.fetch = (async (...args: unknown[]) => {
    fetchCalls.push(args);
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                priority: "High",
                summary: "The dog is limping and may have an injury.",
                recommendedAction: "Dispatch a rescue volunteer.",
                confidence: 94,
                indicators: ["Possible leg injury", "Abnormal posture"],
                whyPriority: "Limping detected",
              }),
            },
          },
        ],
      }),
      { headers: { "Content-Type": "application/json" } },
    ) as Response;
  }) as typeof fetch;

  try {
    const result = await analyzeDogReport({
      description: "A dog is limping and cannot walk properly.",
      concern: "Injury",
      location: "Mylapore",
    });

    assert.equal(fetchCalls.length, 1, "should call Groq when OpenAI is unavailable");
    assert.equal(result.priority, "High");
    assert.match(result.summary, /limping|injury/i);
    assert.equal(result.confidence, 94);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalOpenAiKey === undefined) {
      delete process.env["OPENAI_API_KEY"];
    } else {
      process.env["OPENAI_API_KEY"] = originalOpenAiKey;
    }

    if (originalGroqKey === undefined) {
      delete process.env["GROQ_API_KEY"];
    } else {
      process.env["GROQ_API_KEY"] = originalGroqKey;
    }
  }
});

test("askBowAi answers queries about high-priority cases and wait times", async () => {
  const sampleCases = [
    { id: "PC-101", location: "College Gate", priority: "High" as const },
    { id: "PC-102", location: "Mylapore", priority: "Medium" as const },
    { id: "PC-103", location: "Besant Nagar", priority: "Low" as const },
  ];

  const highRes = await askBowAi({ question: "Show me high-priority cases within 5 km", cases: sampleCases });
  assert.match(highRes.answer, /high-priority|1|PC-101/i);
  assert.equal(highRes.matchedCases?.length, 1);

  const generalRes = await askBowAi({ question: "How many cases were resolved this week?", cases: sampleCases });
  assert.match(generalRes.answer, /resolved|14|welfare/i);
});

test("matchAdoptionDogs returns ranked matches based on home type and lifestyle", async () => {
  const matches = await matchAdoptionDogs({
    homeType: "Apartment",
    familySize: "Family of 4",
    activityLevel: "Moderate",
  });

  assert.equal(matches.length, 4);
  assert.equal(matches[0]?.dogName, "Milo");
  assert.equal(matches[0]?.matchScore, 95);
  assert.ok((matches[0]?.reason.length ?? 0) > 10);
});

test("analyzeFoodDonation flags hazardous food and approves safe food", async () => {
  const safeRes = await analyzeFoodDonation({
    foodType: "Fresh Chicken and Rice",
    quantity: "5 kg",
    location: "Besant Nagar",
  });
  assert.equal(safeRes.safe, true);
  assert.match(safeRes.recommendedFeedingPoint, /Feeding Point C/i);

  const toxicRes = await analyzeFoodDonation({
    foodType: "Leftover chocolate cake with cooked bones",
    quantity: "2 kg",
  });
  assert.equal(toxicRes.safe, false);
  assert.match(toxicRes.message, /Caution|toxic|unsafe/i);
});
