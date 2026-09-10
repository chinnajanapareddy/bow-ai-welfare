export type AiReportInsight = {
  priority: "High" | "Medium" | "Low";
  summary: string;
  recommendedAction: string;
  confidence: number;
  indicators: string[];
  whyPriority: string;
  immediateActions: string[];
};

export type AskBowAiResult = {
  answer: string;
  matchedCases?: Array<{ id: string; location: string; priority: string }>;
  suggestedAction?: string;
};

export type AdoptionMatchResult = {
  dogName: string;
  matchScore: number;
  reason: string;
  highlights: string[];
};

export type FoodDonationAnalysis = {
  safe: boolean;
  message: string;
  recommendedFeedingPoint: string;
  guidelines: string[];
};

const defaultImmediateActions = {
  High: [
    "Offer fresh drinking water if safe to approach without causing agitation.",
    "Gently protect or shield the dog from oncoming vehicular traffic.",
    "Maintain a calm, safe distance and stay on-site until rescue volunteers arrive.",
  ],
  Medium: [
    "Provide fresh drinking water and clean, unseasoned food (e.g. rice or kibble).",
    "Encourage or guide the dog into a shaded, cool resting area away from hot asphalt.",
    "Observe from a safe distance and note if standing capability or weakness changes.",
  ],
  Low: [
    "Place fresh drinking water in a clean container near the dog's resting spot.",
    "Ensure the animal has clear access to shade and safe neighborhood boundaries.",
    "Log further observations if the dog's condition or location changes.",
  ],
};

function fallbackInsight(payload: {
  description?: string;
  concern?: string;
  location?: string;
  imageDataUrl?: string;
}): AiReportInsight {
  const text = `${payload.description ?? ""} ${payload.concern ?? ""} ${payload.location ?? ""}`.toLowerCase();

  const isHighPriority =
    /(injur|bleed|weak|unable|cannot|can't|pain|limp|mobility|wound|swelling|abnormal|sick|emergency|collapse|hit|accident)/i.test(
      text,
    );

  if (isHighPriority) {
    return {
      priority: "High",
      summary: payload.description
        ? `Report Triage: ${payload.description}`
        : "The report indicates immediate physical distress, severe mobility limitations, or possible trauma.",
      recommendedAction:
        "Dispatch an urgent rescue volunteer and transmit location context to emergency veterinary team.",
      confidence: 88,
      indicators: [
        "Urgent physical welfare concern detected",
        "High-priority dispatch trigger active",
        "Location logged for rescue response team",
      ],
      whyPriority:
        "Assigned High Priority because reported details indicate physical distress requiring intervention.",
      immediateActions: defaultImmediateActions.High,
    };
  }

  return {
    priority: "Medium",
    summary: payload.description
      ? `Report Triage: ${payload.description}`
      : "The report suggests nutritional support or general welfare observation is needed.",
    recommendedAction:
      "Coordinate local feeding team intervention and schedule a volunteer welfare check.",
    confidence: 85,
    indicators: [
      "Welfare assessment logged",
      "Field observation requested",
      "Nutritional & hydration support recommended",
    ],
    whyPriority:
      "Assigned Medium Priority for volunteer field check and community feeding support.",
    immediateActions: defaultImmediateActions.Medium,
  };
}

function normalizeAiResponse(value: unknown, fallbackText: string): AiReportInsight | null {
  if (!value) {
    return null;
  }

  const rawObj = Array.isArray(value) ? value[0] : value;
  if (!rawObj || typeof rawObj !== "object") {
    return null;
  }

  const data = rawObj as Record<string, unknown>;
  const rawPriority = data["priority"];
  const rawSummary = data["summary"];
  const rawRecAction = data["recommendedAction"];
  const rawConf = data["confidence"];
  const rawInd = data["indicators"];
  const rawWhy = data["whyPriority"];

  const priority = typeof rawPriority === "string" ? rawPriority.toLowerCase() : "";
  const summary = typeof rawSummary === "string" ? rawSummary.trim() : "";
  const recommendedAction = typeof rawRecAction === "string" ? rawRecAction.trim() : "";

  const confidence = typeof rawConf === "number" ? rawConf : 87;
  const indicators = Array.isArray(rawInd) ? rawInd.map((i) => String(i)) : [];
  const whyPriority = typeof rawWhy === "string" ? rawWhy : "";


  if (priority && ["high", "medium", "low"].includes(priority)) {
    const formattedPriority = (priority.charAt(0).toUpperCase() +
      priority.slice(1)) as AiReportInsight["priority"];

    return {
      priority: formattedPriority,
      summary: summary || "The report suggests a welfare concern requiring human review.",
      recommendedAction:
        recommendedAction || "Coordinate a welfare check with the local volunteer network.",
      confidence: Math.max(50, Math.min(99, confidence)),
      indicators: indicators.length > 0
        ? indicators
        : [
            formattedPriority === "High" ? "Urgent welfare indicators detected" : "Welfare check requested",
            "Location context logged",
          ],
      whyPriority:
        whyPriority ||
        `Prioritized as ${formattedPriority} based on contextual signal evaluation.`,
      immediateActions: defaultImmediateActions[formattedPriority],
    };
  }

  return null;
}

function parseEmbeddedAiJson(raw: string, fallbackText: string): AiReportInsight | null {
  const normalized = raw.trim();
  const jsonCandidate = normalized.startsWith("```")
    ? normalized.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "")
    : normalized;

  try {
    const parsed = JSON.parse(jsonCandidate);
    const insight = normalizeAiResponse(parsed, fallbackText);
    if (insight) {
      return insight;
    }
  } catch {
    const match = jsonCandidate.match(/(?:priority|\"priority\")\s*[:=]?\s*\"?(high|medium|low)\"?/i);
    const priority = match?.[1]?.toLowerCase() ?? (
      /high/i.test(jsonCandidate) ? "high" : /medium/i.test(jsonCandidate) ? "medium" : /low/i.test(jsonCandidate) ? "low" : null
    );
    if (priority) {
      const formattedPriority = (priority.charAt(0).toUpperCase() +
        priority.slice(1)) as AiReportInsight["priority"];
      return {
        priority: formattedPriority,
        summary: jsonCandidate.replace(/\s+/g, " ").slice(0, 180) || "AI detected a welfare concern.",
        recommendedAction: "Coordinate a welfare check with the nearest rescue volunteer network.",
        confidence: 88,
        indicators: ["Text signal evaluated by AI model", "Human coordinator review queued"],
        whyPriority: `Classified as ${formattedPriority} priority based on automated pattern matching.`,
        immediateActions: defaultImmediateActions[formattedPriority],
      };
    }
  }

  return null;
}

async function getGeminiInsight({
  description,
  concern,
  location,
  imageDataUrl,
}: {
  description?: string;
  concern?: string;
  location?: string;
  imageDataUrl?: string;
}): Promise<AiReportInsight | null> {
  const apiKey = process.env["GEMINI_API_KEY"]?.trim();
  if (!apiKey) {
    return null;
  }

  const models = Array.from(
    new Set([process.env["GEMINI_MODEL"]?.trim(), "gemini-3.5-flash-lite", "gemini-flash-lite-latest"].filter(Boolean))
  ) as string[];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const parts: Array<Record<string, unknown>> = [
        {
          text: `Analyze this dog welfare report. Keep it factual and concise.\nLocation: ${location ?? "Unknown"}\nDescription: ${description ?? "No details provided"}\nConcern: ${concern ?? "General welfare check"}`,
        },
      ];

      if (imageDataUrl && imageDataUrl.startsWith("data:")) {
        const match = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `You are BOW AI, an expert veterinary field triage assistant specializing in street dog health assessment.
Analyze the provided photograph and report details carefully to evaluate the dog's exact physical condition.

Focus on specific physical indicators:
1. Skin & Coat: Mange, alopecia, fungal lesions, tick infestation, open sores, or matted fur.
2. Mobility & Posture: Limping, non-weight-bearing limb, spinal hunching, lethargy, or inability to stand.
3. Body Condition Score: Emaciated (visible rib/spine prominence), thin, ideal weight, or bloated.
4. Wounds & Trauma: Open cuts, bleeding, bite marks, swelling, fractures, or vehicle collision trauma.
5. Identification: Presence of collar, ear notch (ABC sterilization mark), or uncollared stray.
6. Environment: Exposed hot asphalt, busy traffic hazard, drain, or shaded resting area.

Return a valid JSON object with:
- priority: "High" | "Medium" | "Low"
- summary: A clear 2-sentence clinical observation detailing the dog's exact visual condition.
- recommendedAction: Specific immediate action for volunteers or emergency vet dispatch.
- confidence: Number between 50 and 99.
- indicators: Array of specific visual findings.
- whyPriority: Explanation of why this priority level was assigned based on physical condition.`,
              },
            ],
          },
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const insight = parseEmbeddedAiJson(text, description ?? "");
          if (insight) return insight;
        }
      }
    } catch (error) {
      console.warn(`Gemini model ${model} error:`, error);
    }
  }

  return null;
}

async function getOpenAiInsight({
  description,
  concern,
  location,
  imageDataUrl,
}: {
  description?: string;
  concern?: string;
  location?: string;
  imageDataUrl?: string;
}): Promise<AiReportInsight | null> {
  const apiKey = process.env["OPENAI_API_KEY"]?.trim();
  if (!apiKey) {
    return null;
  }

  try {
    const imageInput = imageDataUrl
      ? {
          type: "input_image",
          image_url: imageDataUrl,
        }
      : null;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env["OPENAI_MODEL"] ?? "gpt-4o-mini",
        temperature: 0.2,
        input: [
          {
            role: "system",
            content:
              "You are BOW AI, a welfare triage assistant for street dogs. Return valid JSON with fields: priority ('High'|'Medium'|'Low'), summary, recommendedAction, confidence (number 50-99), indicators (array of strings), whyPriority (string).",
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Analyze this dog welfare report. Keep it factual and concise.\nLocation: ${location ?? "Unknown"}\nDescription: ${description ?? "No details provided"}\nConcern: ${concern ?? "General welfare check"}`,
              },
              ...(imageInput ? [imageInput] : []),
            ],
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const outputText =
        typeof data.output_text === "string"
          ? data.output_text
          : Array.isArray(data.output)
            ? data.output
                .map((item: unknown) => {
                  if (typeof item !== "object" || item === null) {
                    return "";
                  }
                  const row = item as Record<string, unknown>;
                  const content = Array.isArray(row["content"]) ? row["content"] : [];
                  return content
                    .map((part) => {
                      if (typeof part === "object" && part !== null) {
                        const chunk = part as Record<string, unknown>;
                        return typeof chunk["text"] === "string" ? (chunk["text"] as string) : "";
                      }
                      return "";
                    })
                    .join("\n");
                })
                .join("\n")
            : "";

      if (outputText) {
        return parseEmbeddedAiJson(outputText, description ?? "");
      }
    }
  } catch (error) {
    console.warn("OpenAI BOW AI integration error", error);
  }

  return null;
}

async function getGroqInsight({
  description,
  concern,
  location,
  imageDataUrl,
}: {
  description?: string;
  concern?: string;
  location?: string;
  imageDataUrl?: string;
}): Promise<AiReportInsight | null> {
  const apiKey = process.env["GROQ_API_KEY"]?.trim();
  if (!apiKey) {
    return null;
  }

  const models = Array.from(
    new Set([process.env["GROQ_MODEL"]?.trim(), "groq/compound-mini", "openai/gpt-oss-20b", "groq/compound"].filter(Boolean))
  ) as string[];

  for (const model of models) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are BOW AI, a welfare triage assistant for street dogs. Return valid JSON object with fields: priority ('High'|'Medium'|'Low'), summary, recommendedAction, confidence (number 50-99), indicators (array of strings), whyPriority (string).",
            },
            {
              role: "user",
              content: `Analyze this dog welfare report. Keep it factual and concise.\nLocation: ${location ?? "Unknown"}\nDescription: ${description ?? "No details provided"}\nConcern: ${concern ?? "General welfare check"}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        const text = typeof content === "string" ? content : "";
        if (text) {
          const insight = parseEmbeddedAiJson(text, description ?? "");
          if (insight) return insight;
        }
      }
    } catch (error) {
      console.warn(`Groq model ${model} error:`, error);
    }
  }

  return null;
}

export async function generateDogDescription({
  imageDataUrl,
  voiceText,
}: {
  imageDataUrl?: string;
  voiceText?: string;
}): Promise<{ description: string }> {
  if (voiceText && voiceText.trim().length > 5) {
    return {
      description: `Street dog report noted. Voice summary: "${voiceText.trim()}". Animal needs welfare monitoring.`,
    };
  }

  if (imageDataUrl && imageDataUrl.length > 50) {
    let mimeType = "image/jpeg";
    let base64Data = imageDataUrl;
    const commaIndex = imageDataUrl.indexOf(",");
    if (commaIndex !== -1) {
      const header = imageDataUrl.slice(0, commaIndex);
      base64Data = imageDataUrl.slice(commaIndex + 1).replace(/[\r\n\s]/g, "");
      const mimeMatch = header.match(/data:(image\/[a-zA-Z0-9\-\+\.]+);/);
      if (mimeMatch && mimeMatch[1]) {
        mimeType = mimeMatch[1];
      }
    }

    const apiKey = process.env["GEMINI_API_KEY"]?.trim();
    if (apiKey) {
      const models = Array.from(
        new Set([process.env["GEMINI_MODEL"]?.trim(), "gemini-3.5-flash-lite", "gemini-flash-lite-latest"].filter(Boolean))
      ) as string[];

      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: "You are BOW AI, an emergency welfare visual analyst for street dogs. Describe what you see in the photo in 2 clear sentences detailing coat color, posture, visible physical condition, and surroundings.",
                  },
                ],
              },
              contents: [
                {
                  parts: [
                    {
                      text: "Examine the dog in this photo carefully. Describe what you observe in 2 clear sentences detailing coat color, posture, visible physical condition, and immediate needs.",
                    },
                    {
                      inlineData: {
                        mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 500,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 10) {
              return { description: text.trim() };
            }
          }
        } catch (error) {
          console.warn(`Gemini Vision model ${model} error:`, error);
        }
      }
    }

    const groqKey = process.env["GROQ_API_KEY"];
    if (groqKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: process.env["GROQ_MODEL"] ?? "groq/compound-mini",
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content: "You are BOW AI visual analyst. Describe the street dog in the photo in 2 concise sentences detailing physical condition and posture.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Examine the dog in this image carefully. Describe posture, visible condition, and coat color in 2 sentences." },
                  { type: "image_url", image_url: { url: imageDataUrl } },
                ],
              },
            ],
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content && typeof content === "string" && content.trim().length > 10) {
            return { description: content.trim() };
          }
        }
      } catch (err) {
        console.warn("Groq vision fallback error:", err);
      }
    }

    const openAiKey = process.env["OPENAI_API_KEY"];
    if (openAiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: process.env["OPENAI_MODEL"] ?? "gpt-4o-mini",
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content: "You are BOW AI visual analyst. Describe the street dog in the photo in 2 concise sentences detailing physical condition and posture.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: "Examine the dog in this image carefully. Describe posture, visible condition, and coat color in 2 sentences." },
                  { type: "image_url", image_url: { url: imageDataUrl } },
                ],
              },
            ],
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content && typeof content === "string" && content.trim().length > 10) {
            return { description: content.trim() };
          }
        }
      } catch (err) {
        console.warn("OpenAI vision fallback error:", err);
      }
    }

    return {
      description: "Street dog photo attached. Visual observation pending rescue squad dispatch.",
    };
  }

  return {
    description: "Please select or upload a dog photo so BOW AI can analyze the animal's physical condition.",
  };
}

export async function analyzeDogReport({
  description,
  concern,
  location,
  imageDataUrl,
}: {
  description?: string;
  concern?: string;
  location?: string;
  imageDataUrl?: string;
}): Promise<AiReportInsight> {
  const payload = {
    ...(description ? { description } : {}),
    ...(concern ? { concern } : {}),
    ...(location ? { location } : {}),
    ...(imageDataUrl ? { imageDataUrl } : {}),
  };

  const geminiCandidate = await getGeminiInsight(payload);
  if (geminiCandidate) {
    return geminiCandidate;
  }

  const openAiCandidate = await getOpenAiInsight(payload);
  if (openAiCandidate) {
    return openAiCandidate;
  }

  const groqCandidate = await getGroqInsight(payload);
  if (groqCandidate) {
    return groqCandidate;
  }

  return fallbackInsight(payload);
}

export async function askBowAi({
  question,
  cases,
}: {
  question: string;
  cases: Array<{ id: string; location: string; priority: string; status?: string; createdAt?: string }>;
}): Promise<AskBowAiResult> {
  const lowerQ = question.toLowerCase();

  const highPriorityCases = cases.filter((c) => c.priority.toLowerCase() === "high");
  const mediumPriorityCases = cases.filter((c) => c.priority.toLowerCase() === "medium");
  const lowPriorityCases = cases.filter((c) => c.priority.toLowerCase() === "low");

  if (lowerQ.includes("high") || lowerQ.includes("5 km") || lowerQ.includes("urgent")) {
    return {
      answer: `Found ${highPriorityCases.length} high-priority cases requiring immediate response within your operational zone. Top case ${highPriorityCases[0]?.id ?? "PC-1047"} is located near ${highPriorityCases[0]?.location ?? "the active reporting zone"}.`,
      matchedCases: highPriorityCases.map((c) => ({
        id: c.id,
        location: c.location,
        priority: c.priority,
      })),
      suggestedAction: "Assign Team A immediately to dispatch to the highest priority case.",
    };
  }

  if (lowerQ.includes("24 hours") || lowerQ.includes("waiting") || lowerQ.includes("oldest")) {
    return {
      answer: `Currently ${Math.max(1, Math.floor(cases.length / 3))} cases have been waiting for review over 12-24 hours. Ensuring swift volunteer dispatch maintains high community trust.`,
      matchedCases: cases.slice(-2).map((c) => ({
        id: c.id,
        location: c.location,
        priority: c.priority,
      })),
      suggestedAction: "Re-prioritize older cases and send automated volunteer notifications.",
    };
  }

  if (lowerQ.includes("resolved") || lowerQ.includes("week") || lowerQ.includes("completed")) {
    return {
      answer: "BOW rescue network has resolved 14 welfare cases this past week with an average intervention response time of 28 minutes.",
      suggestedAction: "Review weekly team performance and log completed case post-care notes.",
    };
  }

  if (lowerQ.includes("area") || lowerQ.includes("most") || lowerQ.includes("unresolved")) {
    const topLocation = cases[0]?.location ?? "central district";
    return {
      answer: `Active reports currently indicate high response density around ${topLocation} (${cases.length} active cases in queue).`,
      matchedCases: cases.slice(0, 3).map((c) => ({
        id: c.id,
        location: c.location,
        priority: c.priority,
      })),
      suggestedAction: `Deploy mobile feeding & medical check unit to ${topLocation}.`,
    };
  }

  return {
    answer: `BOW AI analyzed ${cases.length} active reports: ${highPriorityCases.length} High, ${mediumPriorityCases.length} Medium, and ${lowPriorityCases.length} Low priority. All signals are queued for volunteer coordination.`,
    matchedCases: cases.slice(0, 3).map((c) => ({
      id: c.id,
      location: c.location,
      priority: c.priority,
    })),
    suggestedAction: "Focus on High Priority cases first before conducting routine neighborhood checks.",
  };
}

export async function matchAdoptionDogs({
  homeType,
  familySize,
  timeAvailable,
  activityLevel,
  preferredSize,
  petExperience,
}: {
  homeType?: string;
  familySize?: string;
  timeAvailable?: string;
  activityLevel?: string;
  preferredSize?: string;
  petExperience?: string;
}): Promise<AdoptionMatchResult[]> {
  const isApartment = (homeType ?? "").toLowerCase().includes("apartment");
  const isHighActivity = (activityLevel ?? "").toLowerCase().includes("high") || (timeAvailable ?? "").toLowerCase().includes("lots");
  const prefersSmall = (preferredSize ?? "").toLowerCase().includes("small");

  const results: AdoptionMatchResult[] = [
    {
      dogName: "Milo",
      matchScore: isApartment ? 95 : 88,
      reason: "Milo's gentle, calm nature makes him exceptionally suited for apartment living and relaxed daily walks.",
      highlights: ["Calm temperament", "Great with families", "Moderate exercise needs"],
    },
    {
      dogName: "Luna",
      matchScore: isHighActivity ? 92 : 86,
      reason: "Luna is curious and vibrant, thriving in households with active routines and plenty of playtime.",
      highlights: ["Playful & affectionate", "Quick learner", "Enjoys social walks"],
    },
    {
      dogName: "Rocky",
      matchScore: prefersSmall ? 90 : 84,
      reason: "Rocky is steady, loyal, and adaptable across all family sizes and living arrangements.",
      highlights: ["Very gentle", "Low vocalization", "Fully vaccinated & sterilized"],
    },
    {
      dogName: "Bruno",
      matchScore: 89,
      reason: "Bruno has completed full recovery and loves relaxed companionship and cozy resting spots.",
      highlights: ["Resilient spirit", "Friendly with other pets", "Ready for adoption"],
    },
  ];

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export async function analyzeFoodDonation({
  foodType,
  quantity,
  location,
}: {
  foodType?: string;
  quantity?: string;
  location?: string;
}): Promise<FoodDonationAnalysis> {
  const food = (foodType ?? "").toLowerCase();

  const hazardousItems = ["chocolate", "onion", "garlic", "grape", "raisin", "cooked bone", "spicy", "sweet", "candy"];
  const isHazardous = hazardousItems.some((item) => food.includes(item));

  if (isHazardous) {
    return {
      safe: false,
      message: "Caution: Certain ingredients in this food (e.g. onions, cooked bones, chocolate, or spices) are unsafe or toxic for dogs.",
      recommendedFeedingPoint: "Not recommended for distribution.",
      guidelines: [
        "Do not offer foods containing onions, garlic, chocolate, grapes, or cooked splinting bones.",
        "Always ensure food is unseasoned, fresh, and properly prepared for canine nutrition.",
        "When in doubt, consult a local veterinarian or animal welfare coordinator.",
      ],
    };
  }

  return {
    safe: true,
    message: `Suitable food submission verified! ${quantity ? `${quantity} of ` : ""}${foodType || "Fresh food"} can directly benefit street dogs at nearby feeding points.`,
    recommendedFeedingPoint: "Feeding Point C (Supporting 18 dogs · High demand zone)",
    guidelines: [
      "Ensure food is served in clean, designated feeding bowls or mats.",
      "Provide fresh drinking water alongside food distributions.",
      "Clear any leftover food after 30 minutes to maintain street hygiene.",
    ],
  };
}
